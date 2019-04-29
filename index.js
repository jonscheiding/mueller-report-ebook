import cheerio from 'cheerio';
import fs from 'fs';
import Epub from 'epub-gen';
import shortid from 'shortid';

import sections from './sections.json';

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

function extractFootnotes(footnotesMap) {
  return (current, index) => {
    const footnoteReferences = $(current).find(':not(.g-footnote) sup:not(.g-doc-annotation_index)').toArray();
    const footnotes = $(current).find('.g-footnote').toArray();

    const footnotesFoundOnThisPage = [];

    for(const footnote of footnotes) {
      const sup = $(footnote).find('sup').first();
      footnotesMap[sup.text()] = {
        number: sup.text(),
        id: shortid.generate(),
        content: footnote
      };

      footnotesFoundOnThisPage.push(sup.text());

      sup.remove();
    }

    for(const footnoteReference of footnoteReferences) {
      const number = $(footnoteReference).text();
      const footnote = footnotesMap[number];

      if(!footnote) {
        console.warn(`Couldn't find content for footnote ${number} in ${footnotesFoundOnThisPage} on page ${index}.`);
        continue;
      }

      $(footnoteReference).replaceWith($(`
        <a href='#${footnote.id}' epub:type="noteref"><sup>${number}</sup></a>
      `));
    }
  }
}

const content = sections.map(
  section => {
    const footnotesMap = {};

    const html = $('<div></div>').addClass(section.className);
    const pages = allPages.slice(section.firstPage - 1, section.lastPage);

    manipulateArray(pages, extractFootnotes(footnotesMap));
    manipulateArray(pages, fixMidParagraphPageBreaks);

    for(const page of pages) {
      html.append($(page).find('.g-doc-html > *'));
    }

    for(const footnote of Object.values(footnotesMap)) {
      const footnoteElement = $('<aside></aside>');
      footnoteElement.append($(footnote.content));
      footnoteElement.attr('id', footnote.id);
      footnoteElement.attr('epub:type', 'footnote');

      html.append(footnoteElement);
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
