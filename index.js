import cheerio from 'cheerio';
import fs from 'fs';
import Epub from 'epub-gen';
import shortid from 'shortid';

import sections from './sections.json';
import FootnoteProcessor from './src/FootnoteProcessor.js';

const inputHtml = fs.readFileSync('./input/input.html');
const $ = cheerio.load(inputHtml);

const allPages = $('.g-doc-page').toArray();

function manipulateArray(array, func) {
  const result = [];
  for(let i = 0; i < array.length; i++) {
    const manipulated = func(array[i], i, array[i - 1], array[i + 1]);
    result.push(manipulated || array[i]);
  }
  return result;
}

function fixMidParagraphPageBreaks(current, index, prev) {
  if(!prev) return;

  const firstElementOnPage = $(current).find('.g-doc-html > *')[0];
  if(!firstElementOnPage || firstElementOnPage.name !== 'p') return;
  const text = firstElementOnPage.children[0].data;
  if(!text) return;
  if(text[0] === text[0].toUpperCase()) return;

  const lastParagraphOnPreviousPage = $(prev).find('.g-doc-html p:not(.g-footnote)').last();

  lastParagraphOnPreviousPage.append(' ');
  lastParagraphOnPreviousPage.append($(firstElementOnPage.children));
  $(firstElementOnPage).remove();
}

const content = sections.map(
  section => {
    const footnoteProcessor = new FootnoteProcessor();

    const html = $('<div></div>').addClass(section.className);
    const pages = allPages.slice(section.firstPage - 1, section.lastPage);

    manipulateArray(pages, footnoteProcessor.processPage);
    manipulateArray(pages, fixMidParagraphPageBreaks);

    for(const page of pages) {
      html.append($(page).find('.g-doc-html > *'));
    }

    const data = $('<div></div>');
    data.append(html);

    return {
      title: section.name,
      data: data.html()
    };
  }
)

const options = {
  title: 'Report On The Investigation Into Russian Interference In The 2016 Presidential Election',
  author: 'Robert Mueller',
  publisher: 'U.S. Department of Justice',
  content: content,
  css: fs.readFileSync('./style.css'),
  appendChapterTitles: false
};

new Epub(options, './output/output.epub');
