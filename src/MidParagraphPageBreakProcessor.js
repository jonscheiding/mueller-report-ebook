import { Processor } from './Processor'

export class MidParagraphPageBreakProcessor extends Processor {
  _process (content, cb) {
    if (!this.previousContent) {
      this.previousContent = content
      return
    }

    const firstParagraphOfContent = content.find('p:first-child')
    const lastParagraphOfPreviousContent = this.previousContent.find('p').last()

    const firstCharOfContent = firstParagraphOfContent.text()[0]
    const lastCharOfPreviousContent = lastParagraphOfPreviousContent.text().substr(-1)

    const isBrokenParagraph =
      (firstCharOfContent && firstCharOfContent === firstCharOfContent.toLowerCase()) ||
      (lastCharOfPreviousContent && lastCharOfPreviousContent !== '.')

    if (isBrokenParagraph) {
      lastParagraphOfPreviousContent.append(' ', firstParagraphOfContent.contents())
      firstParagraphOfContent.remove()
    }

    cb(this.previousContent)
    this.previousContent = content
  }

  _end (cb) {
    cb(this.previousContent)
  }
}
