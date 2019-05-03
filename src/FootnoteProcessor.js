import $ from 'cheerio'
import shortid from 'shortid'

class Processor {
  _process (item, cb) { return item }
  _start (cb) { }
  _end (cb) { }

  processItems (items) {
    const results = []

    const cb = result => results.push(result)

    this._start(cb)
    for (const item of items) {
      this._process(item, cb)
    }
    this._end(cb)

    return results
  }
}

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
        console.warn(`Could not find content for footnote ${number}`)
        console.log($(footnoteReferenceElement).parent().html())
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
    const footnotes = {}

    for (const footnoteElement of footnoteElements) {
      const footnote = this._processFootnoteElement(footnoteElement)
      footnotes[footnote.number] = footnote
    }

    this.allFootnotes = { ...this.allFootnotes, ...footnotes }

    return footnotes
  }

  _processFootnoteElement (footnoteElement) {
    const id = shortid()
    const footnoteNumber = $(footnoteElement).find('sup').first()
    const number = footnoteNumber.text()

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

  // _extractFootnotesFromContent()
}
