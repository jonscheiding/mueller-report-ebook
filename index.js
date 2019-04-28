import Epub from 'epub-gen';

const options = {
  title: 'Test book',
  author: 'Somebody',
  content: [
    {
      title: 'A chapter',
      data: `
        <h2>Welcome to the chapter</h2>
        <p>
          The chapter <sup><a href="#n1" epub:type="noteref">1</a></sup> is about stuff.
        </p>
        <aside id="n1" epub:type="footnote">Chapters are usually about stuff.</aside>
        `
    }
  ]
};

new Epub(options, './output/output.epub');
