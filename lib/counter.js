const assert = require('assert')
const util = require('./util')

class Counter {
  constructor (config) {
    const { name, help, labelNames, registerMetric } = util.parseMetricConfig(config)

    this.name = name
    this.help = help
    this.labelNames = labelNames

    this.reset()

    registerMetric(this)
  }

  reset () {
    this.metrics = {}
    if (Object.keys(this.labelNames).length === 0) {
      this.metrics[''] = { value: 0, timestamp: undefined, labels: {} }
    }
  }

  getMetrics () {
    return {
      type: 'counter',
      name: this.name,
      help: this.help,
      values: Object.values(this.metrics)
    }
  }

  inc (value, timestamp, labels = {}) {
    assert.equal(typeof value, 'number', 'value should be a number')
    assert.ok(Number.isFinite(value), 'value should be finite number')
    assert.ok(value >= 0, 'value should not be negative number')
    util.validateTimestamp(timestamp)
    util.validateLabelsObject(labels, this.labelNames)

    const key = util.hashLabelsObject(labels)
    const obj = this.metrics[key]
    if (obj) {
      obj.value += value
      obj.timestamp = timestamp === undefined ? obj.timestamp : timestamp
    } else {
      this.metrics[key] = { value, timestamp, labels }
    }
  }

  labels (labels) {
    util.validateLabelsObject(labels, this.labelNames)
    return {
      inc: (value, timestamp) => this.inc(value, timestamp, labels)
    }
  }

  remove (labels) {
    util.validateLabelsObject(labels, this.labelNames)

    const key = util.hashLabelsObject(labels)
    this.metrics = util.copyObjectWithoutKey(this.metrics, key)
  }

  clear () {
    const key = util.hashLabelsObject({})
    const metrics = { [key]: this.metrics[key] }
    this.metrics = metrics
  }
}

module.exports = Counter
