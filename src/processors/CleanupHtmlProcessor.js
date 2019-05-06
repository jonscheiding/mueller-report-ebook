import { Processor } from './Processor'

export class CleanupHtmlProcessor extends Processor {
  _process (content, cb) {
    const itemsWithBlankIds = content.find('[id=""]')
    itemsWithBlankIds.removeAttr('id')

    const listsInLists = content.find('ol > ol')
    listsInLists.wrap('<li />')

    cb(content)
  }
}
