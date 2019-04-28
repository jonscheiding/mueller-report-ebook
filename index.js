import cheerio from 'cheerio';
import fs from 'fs';
import Epub from 'epub-gen';

import sections from './sections.json';

const inputHtml = fs.readFileSync('./input/input.html');
const $ = cheerio.load(inputHtml);

const allPages = $('.g-doc-page').toArray();

function manipulateArray(array, func) {
  const result = [];
  for(let i = 0; i < array.length; i++) {
    const manipulated = func(array[i], array[i - 1], array[i + 1]);
    result.push(manipulated || array[i]);
  }
  return result;
}

function fixMidParagraphPageBreaks(current, prev) {
  if(!prev) return;

  const firstElementOnPage = $(current).find('.g-doc-html > *')[0];
  if(firstElementOnPage.name !== 'p') return;
  const text = firstElementOnPage.children[0].data;
  if(!text) return;
  if(text[0] === text[0].toUpperCase()) return;

  const lastParagraphOnPreviousPage = $(prev).find('.g-doc-html p').last();

  lastParagraphOnPreviousPage.append(' ');
  lastParagraphOnPreviousPage.append($(firstElementOnPage.children));
  $(firstElementOnPage).remove();
}

const content = sections.map(
  section => {
    const html = $('<div></div>');
    html.addClass(section.className);
    const pages = allPages.slice(section.firstPage - 1, section.lastPage);

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
  title: 'Mueller Report',
  content: content,
  css: fs.readFileSync('./style.css'),
  appendChapterTitles: false
};

new Epub(options, './output/output.epub');
