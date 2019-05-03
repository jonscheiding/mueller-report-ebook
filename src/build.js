import fs from 'fs'
import yargs from 'yargs'
import EPub from 'epub-gen'
import $ from 'cheerio'

import config from '../config.json'
import { ProcessorPipeline } from './Processor'
import { FootnoteProcessor } from './FootnoteProcessor'
import { MidParagraphPageBreakProcessor } from './MidParagraphPageBreakProcessor'

const programArgs = yargs
  .option('output', { type: 'string', demandOption: true })
  .option('source', { type: 'string', demandOption: true })
  .argv

const allPages = JSON.parse(fs.readFileSync(programArgs.source))

const content = config.volumes.map(
  v => {
    const pipeline = new ProcessorPipeline(
      new FootnoteProcessor(),
      new MidParagraphPageBreakProcessor())

    let volumeContent = allPages
      .slice(v.startPage - 1, v.endPage - 1)
      .map(page => $('<div></div>').append(page.markup))

    volumeContent = pipeline.processItems(volumeContent)

    return {
      title: v.title,
      data: volumeContent.map(c => $.html(c)).join('')
    }
  }
)

const epubConfig = {
  ...config.metadata,
  content: content,
  css: fs.readFileSync('./style.css')
}

// eslint-disable-next-line no-new
new EPub(epubConfig, programArgs.output)
