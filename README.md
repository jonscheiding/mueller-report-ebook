# Mueller Report e-book generator

This repository implements a tool that can be used to generate a usable e-book version of the 2019 "Report On The Investigation Into Russian Interference In The 2016 Presidential Election".  The book is generated in MOBI format for Kindles, and EPUB for other e-readers.

### Acknowledgement

This would not have been possible without the hard work of the New York Times transcribing the report.  Their version can be found [here](https://www.nytimes.com/interactive/2019/04/18/us/politics/mueller-report-document.html), and includes a lot of helpful annotations as well as an "Explore By Person" index.

## Installation

To download the generated results, check out the [latest release](https://github.com/jonscheiding/mueller-report-ebook-generator/releases/latest).

### Installation for Kindle

1. Download `mueller-ebook.mobi` from the latest release page.
2. Plug your Kindle in to your computer.  It should show up as an external drive.
3. Copy `mueller-ebook.mobi` into the `documents` folder on your Kindle drive.

Feel free to contribute instructions for other e-readers.

## Development

Clone the repository and run `yarn` to install dependencies.

- To build the e-book, run `yarn build`.
- To make changes, run `yarn start` and then browse to http://localhost:5000.

