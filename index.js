import cheerio from 'cheerio';
import fs from 'fs';
import Epub from 'epub-gen';

const content = fs.readFileSync('./input/input.html');
const $ = cheerio.load(content);

const allPages = $('.g-doc-page');
const output = $('<div></div>');
output.append(allPages.find('p'));

const options = {
  title: 'Mueller Report',
  content: [
    {
      title: 'ALL OF IT',
      data: output.html()
    }
  ]
};

new Epub(options, './output/output.epub');
