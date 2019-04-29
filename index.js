import cheerio from 'cheerio';
import fs from 'fs';
import Epub from 'epub-gen';

import metadata from './metadata.json';
import FootnoteProcessor from './src/FootnoteProcessor.js';
import ParagraphProcessor from './src/ParagraphProcessor.js';

const inputHtml = fs.readFileSync('./input/input.html');
const $ = cheerio.load(inputHtml);

const allPages = $('.g-doc-page').toArray();

const content = metadata.sections.map(
  section => {
    const html = $('<div></div>').addClass(section.className);
    const pages = allPages.slice(section.firstPage - 1, section.lastPage);

    new FootnoteProcessor().processPages(pages);
    new ParagraphProcessor().processPages(pages);

    for(const page of pages) {
      html.append($(page).find('.g-doc-html > *'));
    }

    const data = $('<div></div>');
    data.append(html);

    return {
      title: section.name,
      excludeFromToc: section.excludeFromToc,
      data: data.html()
    };
  }
)

const options = {
  title: metadata.title,
  author: metadata.author,
  publisher: metadata.publisher,
  content: content,
  cover: metadata.cover,
  css: fs.readFileSync('./style.css'),
  appendChapterTitles: false
};

new Epub(options, './build/output.epub');
