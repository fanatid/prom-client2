const assert = require('assert')
const TDigest = require('tdigest')
const util = require('./util')

function createMetric (labels) {
  return { labels, td: new TDigest(), sum: 0, count: 0 }
}

class Summary {
  constructor (config) {
    const { name, help, labelNames, registerMetric, rest } = util.parseMetricConfig(config)

    assert.ok(!labelNames.includes('quantile'), 'label `quantile` is reserved')
    assert.ok(Array.isArray(rest.percentiles), 'percentiles should be an object')
    assert.ok(rest.percentiles[0] < 1, 'values in percentiles should be less than one')
    for (let i = 1; i < rest.percentiles.length; i++) {
      assert.ok(rest.percentiles[i] < 1, 'values in percentiles should be less than one')
      assert.ok(rest.percentiles[i - 1] < rest.percentiles[i], 'values in percentiles should be in sorted order')
    }

    this.name = name
    this.help = help
    this.labelNames = labelNames
    this.percentiles = rest.percentiles

    this.reset()

    registerMetric(this)
  }

  reset () {
    this.metrics = {}
    if (Object.keys(this.labelNames).length === 0) {
      const key = util.hashLabelsObject({})
      this.metrics[key] = createMetric({})
    }
  }

  getMetrics () {
    const sSum = `${this.name}_sum`
    const sCount = `${this.name}_count`

    const values = []
    for (const metric of this.metrics) {
      metric.td.compress()
      for (const percentile of this.percentiles) {
        const labels = { quantile: percentile, ...metric.labes }
        const value = metric.td.percentile(percentile)
        values.push({ labels, value })
      }

      values.push({ labels: metric.labels, value: metric.sum, metricName: sSum })
      values.push({ labels: metric.labels, value: metric.count, metricName: sCount })
    }

    return {
      type: 'summary',
      name: this.name,
      help: this.help,
      values
    }
  }

  observe (value, labels = {}) {
    assert.ok(Number.isFinite(value), 'value should ne finite number')
    util.validateLabelsObject(labels, this.labelNames)

    const key = util.hashLabelsObject(labels)
    if (!this.metrics[key]) this.metrics[key] = createMetric(labels)

    const obj = this.metrics[key]
    obj.td.push(value)
    obj.sum += value
    obj.count += 1
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

module.exports = Summary
