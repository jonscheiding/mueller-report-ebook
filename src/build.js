import yargs from 'yargs'
import EPub from 'epub-gen'
import fs from 'fs'

import config from '../config.json'

const programArgs = yargs
  .option('output', { type: 'string', demandOption: true })
  .option('source', { type: 'string', demandOption: true })
  .argv

const pages = JSON.parse(fs.readFileSync(programArgs.source))
const content = pages.map(p => p.markup).join()

const epubConfig = {
  ...config.metadata,
  content: [{
    title: 'Full report',
    data: content
  }]
}

// eslint-disable-next-line no-new
new EPub(epubConfig, programArgs.output)
