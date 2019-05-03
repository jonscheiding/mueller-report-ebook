import $ from 'cheerio'
import shortid from 'shortid'

import { Processor } from './Processor'
import { of } from 'rxjs'

export class FootnoteProcessor extends Processor {
  constructor () {
    super()
    this.allFootnotes = {}
  }

  _process (content, cb) {
    this._extractFootnotesFromContent(content)
    this._processFootnoteReferencesInContent(content)

    cb(content)
  }

  _end (cb) {
    const footnotesContainer = $('<div></div>')
      .append(Object.values(this.allFootnotes)
        .map(f => f.element))

    cb(footnotesContainer)
  }

  _processFootnoteReferencesInContent (content) {
    content.find('.g-doc-annotation_index').remove()

    const footnoteReferenceElements = content.find(':not(aside) sup').toArray()
    for (const footnoteReferenceElement of footnoteReferenceElements) {
      const number = $(footnoteReferenceElement).text()

      if (!this.allFootnotes[number]) {
        console.warn(`Could not find content for footnote ${number}.`)
        continue
      }

      const id = this.allFootnotes[number].id

      const footnoteLink = $('<a />')
        .attr('id', `${id}-source`)
        .attr('href', `#${id}-target`)
        .attr('epub:type', 'noteref')

      $(footnoteReferenceElement).wrap(footnoteLink)
    }
  }

  _extractFootnotesFromContent (content) {
    const footnoteElements = content.find('.g-footnote').toArray()

    for (const footnoteElement of footnoteElements) {
      const footnote = this._processFootnoteElement(footnoteElement)

      if (!footnote) {
        continue
      }

      if (footnote.number in this.allFootnotes) {
        console.warn(`Duplicate footnote number ${footnote.number}.`)
        continue
      }

      this.allFootnotes[footnote.number] = footnote
    }
  }

  _processFootnoteElement (footnoteElement) {
    const id = shortid()
    const footnoteNumber = $(footnoteElement).find('sup').first()
    const number = footnoteNumber.text()

    if (!number) {
      this._attachFootnoteElementToPreviousFootnote(footnoteElement)
      return null
    }

    const footnoteBackLink = $('<a />')
      .attr('href', `#${id}-source`)
      .attr('epub:type', 'noteref')

    footnoteNumber.wrap(footnoteBackLink)

    const element = $('<aside />')
      .attr('id', `${id}-target`)
      .attr('epub:type', 'footnote')
      .append($(footnoteElement).contents())

    $(footnoteElement).remove()

    return { id, number, element }
  }

  _attachFootnoteElementToPreviousFootnote (footnoteElement) {
    const lastFootnoteNumber = Object.keys(this.allFootnotes).slice(-1)[0]
    this.allFootnotes[lastFootnoteNumber].element.append(
      ' ', $(footnoteElement).contents())

    $(footnoteElement).remove()
  }
}
