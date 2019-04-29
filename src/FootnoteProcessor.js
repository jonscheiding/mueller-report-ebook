import $ from 'cheerio';
import shortid from 'shortid';

export default class FootnoteProcessor {
  constructor() {
    this.footnotesMap = {};
  }

  processPage = (page) => {
    page = $(page);

    const referencesInPage = this.findFootnoteReferencesInPage(page);
    const footnotesInPageMap = this.findFootnotesInPage(page);

    this.footnotesMap = {
      ...this.footnotesMap,
      ...footnotesInPageMap
    };

    this.replaceFootnoteReferences(referencesInPage);
    this.replaceFootnotes(Object.values(footnotesInPageMap));
  }

  replaceFootnoteReferences = (references) => {
    for(const reference of references) {
      const number = $(reference).text();
      const footnote = this.footnotesMap[number];

      if(!footnote) {
        console.warn(`Couldn't find content for footnote ${number}.`);
        continue;
      }

      const referenceLink = $(`<a><sup>${number}</sup></a>`)
        .attr('href', `#${footnote.id}`)
        .attr('epub:type', 'noteref');

      $(reference).replaceWith(referenceLink);
    }
  }

  replaceFootnotes = (footnotes) => {
    for(const footnote of footnotes) {
      const parent = $(footnote.contentEl).parent();

      const footnoteEl = $('<aside></aside>');
      footnoteEl.append($(footnote.contentEl));
      footnoteEl.attr('id', footnote.id);
      footnoteEl.attr('epub:type', 'footnote');

      parent.append(footnoteEl);
      $(footnote.numberEl).remove();
    }
  }

  findFootnoteReferencesInPage = (page) => {
    return $(page).find(`
      :not(.g-footnote) 
        > sup:not(.g-doc-annotation_index)
    `).toArray();
  }

  findFootnotesInPage = (page) => {
    const elements = $(page).find('.g-footnote').toArray();
    const footnotesMap = {};

    for(const element of elements) {
      const numberEl = $(element).find('sup:not(.g-doc-annotation_index)');
      const number = numberEl.text();

      footnotesMap[number] = {
        id: shortid.generate(),
        number: number,
        contentEl: element,
        numberEl: numberEl
      }
    }

    return footnotesMap;
  }
}