const assert = require('assert')
const util = require('./util')

function validateArgs (value, timestamp, labels, labelNames) {
  assert.equal(typeof value, 'number', 'value should be a number')
  assert.ok(Number.isFinite(value), 'value should be finite number')
  util.validateTimestamp(timestamp)
  util.validateLabelsObject(labels, labelNames)

  return util.hashLabelsObject(labels)
}

class Gauge {
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
      const key = util.hashLabelsObject({})
      this.metrics[key] = { value: 0, timestamp: undefined, labels: {} }
    }
  }

  getMetrics () {
    return {
      type: 'gauge',
      name: this.name,
      help: this.help,
      values: Object.values(this.metrics)
    }
  }

  set (value, timestamp, labels = {}) {
    const key = validateArgs(value, timestamp, labels, this.labelNames)
    const obj = this.metrics[key]
    timestamp = timestamp === undefined && obj ? obj.timestamp : timestamp
    this.metrics[key] = { value, timestamp, labels }
  }

  inc (value, timestamp, labels = {}) {
    const key = validateArgs(value, timestamp, labels, this.labelNames)

    const obj = this.metrics[key]
    if (obj) {
      obj.value += value
      obj.timestamp = timestamp === undefined ? obj.timestamp : timestamp
    } else {
      this.metrics[key] = { value, timestamp, labels }
    }
  }

  dec (value, timestamp, labels = {}) {
    const key = validateArgs(value, timestamp, labels, this.labelNames)

    const obj = this.metrics[key]
    if (obj) {
      obj.value -= value
      obj.timestamp = timestamp === undefined ? obj.timestamp : timestamp
    } else {
      this.metrics[key] = { value: -value, timestamp, labels }
    }
  }

  setToCurrentTime (labels) {
    const value = Math.floor(Date.now())
    this.set(value, undefined, labels)
  }

  startTimer (labelsStart) {
    const ts = util.diffTimeSeconds()
    return (labelsEnd) => {
      const value = util.diffTimeSeconds(ts)
      const labels = Object.assign({}, labelsStart, labelsEnd)
      this.set(value, undefined, labels)
    }
  }

  labels (labels) {
    util.validateLabelsObject(labels, this.labelNames)
    return {
      set: (value, timestamp) => this.set(value, timestamp, labels),
      inc: (value, timestamp) => this.inc(value, timestamp, labels),
      dec: (value, timestamp) => this.dec(value, timestamp, labels),
      setToCurrentTime: () => this.setToCurrentTime(labels),
      startTimer: () => this.startTimer(labels)
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

module.exports = Gauge
