export class Processor {
  _process (item, cb) { cb(item) }
  _start (cb) { }
  _end (cb) { }

  processItems (items) {
    const results = []

    const cb = result => results.push(result)

    this._start(cb)
    for (const item of items) {
      this._process(item, cb)
    }
    this._end(cb)

    return results
  }
}

export class ProcessorPipeline extends Processor {
  constructor (...processors) {
    super()
    this.processors = processors
  }

  processItems (items) {
    for (const processor of this.processors) {
      items = processor.processItems(items)
    }
    return items
  }
}
