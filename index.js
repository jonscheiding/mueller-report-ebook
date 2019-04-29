import cheerio from 'cheerio';
import fs from 'fs';
import Epub from 'epub-gen';

import sections from './sections.json';
import FootnoteProcessor from './src/FootnoteProcessor.js';
import ParagraphProcessor from './src/ParagraphProcessor.js';

const inputHtml = fs.readFileSync('./input/input.html');
const $ = cheerio.load(inputHtml);

const allPages = $('.g-doc-page').toArray();

const content = sections.map(
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
  title: 'Report On The Investigation Into Russian Interference In The 2016 Presidential Election',
  author: 'Robert Mueller',
  publisher: 'U.S. Department of Justice',
  content: content,
  cover: './cover.png',
  css: fs.readFileSync('./style.css'),
  appendChapterTitles: false
};

new Epub(options, './build/output.epub');
