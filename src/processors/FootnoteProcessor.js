import $ from 'cheerio'
import shortid from 'shortid'

import { Processor } from './Processor'

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
    const footnotes = Object.values(this.allFootnotes)
    if (footnotes.length === 0) {
      return
    }

    const footnotesContainer = $('<div />')
      .addClass('footnotes')

    for (const footnote of footnotes) {
      if (footnote.references === 0) {
        console.warn(`Footnote ${footnote.number} has no references.`)
        continue
      }

      footnotesContainer.append(footnote.element)
    }

    cb(footnotesContainer)
  }

  _processFootnoteReferencesInContent (content) {
    const footnoteReferenceElements = content
      .find(':not(aside) sup:not(.g-doc-annotation_index)')
      .toArray()

    for (const footnoteReferenceElement of footnoteReferenceElements) {
      const number = $(footnoteReferenceElement).text()
      const footnote = this.allFootnotes[number]

      if (!footnote) {
        console.warn(`Could not find content for footnote ${number}.`)
        continue
      }

      let id = footnote.id
      footnote.references++

      if (footnote.references > 1) {
        $(footnote.element).prepend(
          this._createFootnoteLink(footnote, true)
        )

        id = `${id}-${footnote.references}`

        console.log('duplicate footnote ' + number + ' on ' + $(footnoteReferenceElement).parent().text())
      }

      const footnoteLink = this._createFootnoteLink(footnote)

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
    const numberElement = $(footnoteElement).find('sup').first()
    const number = numberElement.text()

    if (!number) {
      this._attachFootnoteElementToPreviousFootnote(footnoteElement)
      return null
    }

    const element = $('<aside />')
      .attr('epub:type', 'footnote')
      .addClass('footnote')
      .append($(footnoteElement).contents())

    const footnote = { id, number, element, references: 0 }

    numberElement.wrap(this._createFootnoteLink(footnote, true))
    $(footnoteElement).remove()

    return footnote
  }

  _attachFootnoteElementToPreviousFootnote (footnoteElement) {
    const lastFootnoteNumber = Object.keys(this.allFootnotes).slice(-1)[0]
    this.allFootnotes[lastFootnoteNumber].element.append(
      ' ', $(footnoteElement).contents())

    $(footnoteElement).remove()
  }

  _createFootnoteLink (footnote, isBackLink = false) {
    let baseId = footnote.id
    const isPrimary = footnote.references <= 1

    if (!isPrimary) {
      baseId += `-${footnote.references}`
    }

    let id = `${baseId}-source`
    let href = `${baseId}-target`
    if (isBackLink) {
      [ id, href ] = [ href, id ]
    }

    const link = $('<a />')
      .attr('href', '#' + href)
      .attr('epub:type', 'noteref')
      .attr('id', id)

    return link
  }
}
