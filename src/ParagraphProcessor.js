import $ from 'cheerio';

export default class ParagraphProcessor {
  processPages = (pages) => {
    for(let i = 0; i < pages.length; i++) {
      this.fixMidParagraphPageBreak(pages[i], pages[i - 1]);
    }
  }

  fixMidParagraphPageBreak = (page, previousPage) => {
    page = $(page);
    previousPage = $(previousPage);

    const firstElementOnPage = page.find('.g-doc-html > *')[0];
    if(!firstElementOnPage || firstElementOnPage !== 'p') {
      return;
    }

    const text = $(firstElementOnPage).text();
    if(!text) {
      return;
    }

    if(text[0] === text[0].toUpperCase()) {
      return;
    }

    const lastParagraphOnPreviousPage = previousPage.find('.g-doc-html p:not(.g-footnote)').last();
    lastParagraphOnPreviousPage.append(' ');
    lastParagraphOnPreviousPage.append($(firstElementOnPage.children));
    $(firstElementOnPage).remove();
  }
}
