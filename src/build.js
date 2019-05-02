import yargs from 'yargs'
import EPub from 'epub-gen'
import fs from 'fs'

import config from '../config.json'

const programArgs = yargs
  .option('output', { type: 'string', demandOption: true })
  .option('source', { type: 'string', demandOption: true })
  .argv

const allPages = JSON.parse(fs.readFileSync(programArgs.source))

const content = config.volumes.map(
  v => {
    const volumePages = allPages.slice(v.startPage - 1, v.endPage - 1)
    return {
      title: v.title,
      data: volumePages.map(p => p.markup).join('')
    }
  }
)

const epubConfig = {
  ...config.metadata,
  content: content
}

// eslint-disable-next-line no-new
new EPub(epubConfig, programArgs.output)
