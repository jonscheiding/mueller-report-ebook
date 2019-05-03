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

const data = $('<div></div>')

for (const v of config.volumes) {
  console.log(`Processing ${v.title}.`)

  const pipeline = new ProcessorPipeline(
    new FootnoteProcessor(),
    new MidParagraphPageBreakProcessor())

  let volumeContent = allPages
    .slice(v.startPage - 1, v.endPage - 1)
    .map(page => $('<div></div>')
      .attr('id', `g-page-${page.url}`)
      .append(page.markup))

  data.append(pipeline.processItems(volumeContent))
}

const epubConfig = {
  ...config.metadata,
  content: [{
    title: 'report',
    data: $.html(data),
    excludeFromToc: true
  }],
  appendChapterTitles: false,
  css: fs.readFileSync('./style.css')
}

// eslint-disable-next-line no-new
new EPub(epubConfig, programArgs.output)
