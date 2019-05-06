import $ from 'cheerio'
import shortid from 'shortid'

import { Processor } from './Processor'

export class AnnotationProcessor extends Processor {
  constructor (annotations) {
    super()
    this.annotations = annotations
    this.annotationsUsed = []
  }

  _process (content, cb) {
    const annotationReferences = content.find('.g-doc-annotation_index')

    for (const ref of annotationReferences.toArray()) {
      const number = $(ref).text()
      const page = content.attr('id')

      const annotation = this.annotations.find(
        a => a.page === page && a.number === number
      )

      if (!annotation) {
        console.warn(`Could not find annotation ${number} on page ${page}.`)
        continue
      }

      annotation.id = shortid.generate()
      this.annotationsUsed.push(annotation)

      const refLink = $('<a />')
        .attr('id', `${annotation.id}-source`)
        .attr('href', `#${annotation.id}-target`)
        .attr('epub:type', 'noteref')

      const refContent = $(ref).prev('strong')

      $(refContent).wrap(refLink)
      $(ref).remove()
    }

    cb(content)
  }

  _end (cb) {
    const annotationsEl = $('<div />')

    for (const annotation of this.annotationsUsed) {
      const annotationEl = $('<aside />')
        .attr('id', `${annotation.id}-target`)
        .attr('epub:type', 'footnote')

      annotationEl.append($('<a />')
        .attr('href', `#${annotation.id}-source`)
        .attr('epub:type', 'noteref')
        .text('↪'))
      annotationEl.append(' ')
      annotationEl.append(annotation.markup)

      annotationsEl.append(annotationEl)
    }

    cb(annotationsEl)
  }
}
