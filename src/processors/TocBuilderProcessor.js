import $ from 'cheerio'
import shortid from 'shortid'

import { Processor } from './Processor'

export class TocBuilderProcessor extends Processor {
  constructor () {
    super()
    this.tocEntries = { }
    this.hasToc = false
  }

  _process (content, cb) {
    if (content.hasClass('toc')) {
      this.hasToc = true
      this._processTocPage(content)
    } else {
      this._processContentPage(content)
    }

    cb(content)
  }

  _processTocPage (content) {
    for (const tocEntry of content.find('p').toArray()) {
      const tocKey = this._makeTocKey(tocEntry)
      this.tocEntries[tocKey] = tocEntry
    }
  }

  _processContentPage (content) {
    if (!this.hasToc) {
      return
    }

    for (const tocTarget of content.find('h1,h2,h3,h4,h5,h6').toArray()) {
      const tocKey = this._makeTocKey(tocTarget)
      const tocEntry = this.tocEntries[tocKey]
      if (!tocEntry) {
        console.warn(`No TOC entry for '${$(tocTarget).text()}'.`)
        continue
      }

      const id = shortid.generate()

      $(tocTarget).attr('id', id)
      $(tocEntry).find('a').attr('href', `#${id}`)
    }
  }

  _makeTocKey (el) {
    return $(el).text().replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  }
}
