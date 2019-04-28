import cheerio from 'cheerio';
import fs from 'fs';
import Epub from 'epub-gen';

const inputHtml = fs.readFileSync('./input/input.html');
const $ = cheerio.load(inputHtml);

const allPages = $('.g-doc-page').toArray();

const sections = [
  { name: "Volume I Cover", firstPage: 1, lastPage: 1 },
  // { name: "Volume I TOC", firstPage: 3, lastPage: 7, isToc = true },
  { name: "Volume I Introduction", firstPage: 9, lastPage: 11 },
  { name: "Volume I Summary", firstPage: 12, lastPage: 18 },
  { name: "Volume I", firstPage: 19, lastPage: 207 },
  { name: "Volume II Cover", firstPage: 208, lastPage: 208 },
  { name: "Volume II Introduction", firstPage: 213, lastPage: 214 },
  { name: "Volume II Summary", firstPage: 215, lastPage: 220 }
]

const content = sections.map(
  section => {
    const html = $('<div></div>');
    const pages = allPages.slice(section.firstPage - 1, section.lastPage - 1);
    for(const page of pages) {
      html.append($(page).find('.g-doc-html > *'));
    }

    return {
      title: section.name,
      data: html.html()
    };
  }
)

const options = {
  title: 'Mueller Report',
  content: content
};

new Epub(options, './output/output.epub');
