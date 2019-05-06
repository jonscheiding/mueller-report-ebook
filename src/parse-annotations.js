import fs from 'fs'
import cheerio from 'cheerio'
import yargs from 'yargs'

const programArgs = yargs
  .option('output', { type: 'string', demandOption: true })
  .option('source', { type: 'string', demandOption: true })
  .argv

const $ = cheerio.load(fs.readFileSync(programArgs.source))

const annotations = $('.g-doc-annotation').toArray().map((el) => {
  const page = $(el).closest('.g-doc-page')
  const number = $(el).find('.g-doc-annotation_number')

  number.remove()

  return {
    page: page.attr('id'),
    number: number.text(),
    markup: $(el).html()
  }
})

fs.writeFileSync(programArgs.output, JSON.stringify(annotations, null, '  '))
