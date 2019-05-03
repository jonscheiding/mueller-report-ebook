import fs from 'fs'
import yargs from 'yargs'
import EPub from 'epub-gen'
import $ from 'cheerio'

import config from '../config.json'
import { FootnoteProcessor } from './FootnoteProcessor.js'

const programArgs = yargs
  .option('output', { type: 'string', demandOption: true })
  .option('source', { type: 'string', demandOption: true })
  .argv

const allPages = JSON.parse(fs.readFileSync(programArgs.source))

const content = config.volumes.map(
  v => {
    const footnoteProcessor = new FootnoteProcessor()
    let volumeContent = allPages
      .slice(v.startPage - 1, v.endPage - 1)
      .map(page => $('<div></div>').append(page.markup))

    volumeContent = footnoteProcessor.processItems(volumeContent)

    return {
      title: v.title,
      data: volumeContent.map(c => $.html(c)).join('')
    }
  }
)

const epubConfig = {
  ...config.metadata,
  content: content
}

// eslint-disable-next-line no-new
new EPub(epubConfig, programArgs.output)
