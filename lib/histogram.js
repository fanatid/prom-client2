const assert = require('assert')
const util = require('./util')

function createMetric (labels, buckets) {
  const values = {}
  for (const bucket of buckets) values[bucket] = 0

  return { labels, values, sum: 0 }
}

class Histogram {
  constructor (config) {
    const { name, help, labelNames, registerMetric, rest } = util.parseMetricConfig(config)

    assert.ok(!labelNames.includes('le'), 'label `le` is reserved')
    assert.ok(Array.isArray(rest.buckets), 'buckets should be an object')
    for (let i = 1; i < rest.buckets.length; i++) {
      assert.ok(rest.buckets[i - 1] < rest.buckets[i], 'values in bucket should be in sorted order')
    }

    this.name = name
    this.help = help
    this.labelNames = labelNames
    this.buckets = rest.buckets

    this.reset()

    registerMetric(this)
  }

  static bucketsLinear (start, width, count) {
    const buckets = []
    for (let i = 0; i < count; i += 1, start += width) buckets.push(start)
    return buckets
  }

  static bucketsExponential (start, factor, count) {
    const buckets = []
    for (let i = 0; i < count; i += 1, start *= factor) buckets.push(start)
    return buckets
  }

  reset () {
    this.metrics = {}
    if (Object.keys(this.labelNames).length === 0) {
      const key = util.hashLabelsObject({})
      this.metrics[key] = createMetric({}, this.buckets)
    }
  }

  getMetrics () {
    const sBucket = `${this.name}_bucket`
    const sSum = `${this.name}_sum`
    const sCount = `${this.name}_count`
    const createObj = (labels, value, metricName) => ({ labels, value, metricName })

    const values = []
    for (const metric of this.metrics) {
      let count = 0
      for (const bucket of this.buckets) {
        count += metric.values[bucket]
        values.push(createObj({ le: bucket, ...metric.labels }), count, sBucket)
      }

      values.push(createObj({ le: '+Itf', ...metric.labels }, count, sBucket))
      values.push(createObj(metric.labels, metric.sum, sSum))
      values.push(createObj(metric.labels, count, sCount))
    }

    return {
      type: 'histogram',
      name: this.name,
      help: this.help,
      values
    }
  }

  observe (value, labels = {}) {
    assert.ok(Number.isFinite(value), 'value should ne finite number')
    util.validateLabelsObject(labels, this.labelNames)

    const key = util.hashLabelsObject(labels)
    if (!this.metrics[key]) this.metrics[key] = createMetric(labels, this.buckets)

    const obj = this.metrics[key]
    for (const bucket of this.buckets) {
      if (value <= bucket) {
        obj.values[bucket] += 1
        break
      }
    }

    obj.sum += value
  }

  startTimer (labelsStart) {
    const ts = util.diffTimeSeconds()
    return (labelsEnd) => {
      const value = util.diffTimeSeconds(ts)
      const labels = Object.assign({}, labelsStart, labelsEnd)
      this.observe(value, labels)
    }
  }

  labels (labels) {
    util.validateLabelsObject(labels, this.labelNames)
    return {
      observe: (value) => this.observe(value, labels),
      startTimer: () => this.startTimer(labels)
    }
  }
}

module.exports = Histogram
