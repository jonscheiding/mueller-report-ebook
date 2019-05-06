import fs from 'fs'
import yargs from 'yargs'
import EPub from 'epub-gen'
import $ from 'cheerio'

import config from '../config.json'
import { ProcessorPipeline } from './processors/Processor'
import { AnnotationProcessor } from './processors/AnnotationProcessor.js'
import { FootnoteProcessor } from './processors/FootnoteProcessor'
import { MidParagraphPageBreakProcessor } from './processors/MidParagraphPageBreakProcessor'
import { SectionBreakProcessor } from './processors/SectionBreakProcessor.js'
import { TitlePageProcessor } from './processors/TitlePageProcessor.js'

const programArgs = yargs
  .option('output', { type: 'string', demandOption: true })
  .option('pages', { type: 'string', demandOption: true })
  .option('annotations', { type: 'string', demandOption: true })
  .argv

function createPageElement (volume, page) {
  const pageNumber = parseInt(page.url)
  const isTocPage = volume.tocStartPage &&
    volume.tocStartPage <= pageNumber && volume.tocEndPage >= pageNumber

  const element = $('<div></div>')
    .attr('data-page', page.url.toString())
    .attr('id', `g-page-${page.url}`)
    .addClass('page')

  if (isTocPage) {
    element.addClass('toc')
  }

  element.append(page.markup)

  return element
}

const pages = JSON.parse(fs.readFileSync(programArgs.pages))
const annotations = JSON.parse(fs.readFileSync(programArgs.annotations))

const data = $('<div></div>')

for (const v of config.volumes) {
  console.log(`Processing ${v.title}.`)

  const pipeline = new ProcessorPipeline(
    new TitlePageProcessor(),
    new FootnoteProcessor(),
    new AnnotationProcessor(annotations),
    new MidParagraphPageBreakProcessor(),
    new SectionBreakProcessor(v.sectionStartPages))

  let volumeContent = pages
    .slice(v.startPage - 1, v.endPage)
    .map(page => createPageElement(v, page))

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
