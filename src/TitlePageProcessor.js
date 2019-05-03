import { Processor } from './Processor'

export class TitlePageProcessor extends Processor {
  constructor () {
    super()
    this.isFirstContent = true
  }

  _process (content, cb) {
    if (this.isFirstContent) {
      content.addClass('title')
    }

    this.isFirstContent = false

    cb(content)
  }
}
