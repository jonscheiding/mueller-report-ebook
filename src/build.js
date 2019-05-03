import fs from 'fs'
import yargs from 'yargs'
import EPub from 'epub-gen'
import $ from 'cheerio'

import config from '../config.json'
import { ProcessorPipeline } from './Processor'
import { FootnoteProcessor } from './FootnoteProcessor'
import { MidParagraphPageBreakProcessor } from './MidParagraphPageBreakProcessor'
import { SectionBreakProcessor } from './SectionBreakProcessor.js'
import { TitlePageProcessor } from './TitlePageProcessor.js'

const programArgs = yargs
  .option('output', { type: 'string', demandOption: true })
  .option('source', { type: 'string', demandOption: true })
  .argv

const allPages = JSON.parse(fs.readFileSync(programArgs.source))

const data = $('<div></div>')

for (const v of config.volumes) {
  console.log(`Processing ${v.title}.`)

  const pipeline = new ProcessorPipeline(
    new TitlePageProcessor(),
    new FootnoteProcessor(),
    new MidParagraphPageBreakProcessor(),
    new SectionBreakProcessor(v.sectionStartPages))

  let volumeContent = allPages
    .slice(v.startPage - 1, v.endPage)
    .map(page => $('<div></div>')
      .attr('data-page', page.url.toString())
      .attr('id', `g-page-${page.url}`)
      .addClass('page')
      .append(page.markup))

  data.append(pipeline.processItems(volumeContent))
}

const epubConfig = {
  ...config.metadata,
  content: [{
    title: 'report',
    data: $.html(data),
    excludeFromToc: true,
    volumes: config.volumes
  }],
  css: fs.readFileSync('./style.css'),
  cover: './cover.png',
  appendChapterTitles: false,
  customHtmlTocTemplatePath: './templates/Toc.xhtml.ejs',
  customNcxTocTemplatePath: './templates/Toc.ncx.ejs'
}

// eslint-disable-next-line no-new
new EPub(epubConfig, programArgs.output)
