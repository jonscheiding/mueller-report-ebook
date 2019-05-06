import $ from 'cheerio'

import { Processor } from './Processor'

export class SectionBreakProcessor extends Processor {
  constructor (breakPages) {
    super()
    this.breakPages = {}
    if (breakPages) {
      for (const page of breakPages) {
        this.breakPages[page.toString()] = true
      }
    }
  }

  _process (content, cb) {
    if (!content) {
      cb(content)
      return
    }

    const page = content.attr('data-page')

    if (this.breakPages[page]) {
      content.addClass('section-break')
    }

    cb(content)
  }

  _end (cb) {
    this._emitSectionBreak(cb)
  }

  _emitSectionBreak (cb) {
    cb($('<p />').addClass('section-break'))
  }
}
