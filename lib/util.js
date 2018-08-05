const assert = require('assert')

// https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
const reMetricName = /^[a-zA-Z_:][a-zA-Z0-9_:]*$/
const reMetricLabel = /^[a-zA-Z_][a-zA-Z0-9_]*$/

function parseMetricConfig ({ name, help, labelNames = [], registers = [], ...rest } = {}) {
  assert.equal(typeof name, 'string', 'name should be a string')
  assert.ok(reMetricName.test(name), `invalid metric name: ${name}`)

  assert.equal(typeof help, 'string', 'help should be a string')

  assert.ok(Array.isArray(labelNames), 'labelNames should be an array')
  for (const label of labelNames) {
    assert.ok(reMetricLabel.test(label), `invalid metric label: ${label}`)
  }

  assert.ok(Array.isArray(registers), 'registers should be an array')
  for (const register of registers) {
    assert.equal(typeof register, 'object', 'register should be an object')
    assert.equal(typeof register.registerMetric, 'function', 'register should have function registerMetric')
  }

  return {
    name,
    help,
    labelNames,
    registerMetric: (metric) => {
      for (const register of registers) register.registerMetric(metric)
    },
    rest
  }
}

function validateTimestamp (timestamp) {
  if (timestamp === undefined) return

  assert.ok(Number.isFinite(timestamp), 'timestamp should be finite number')
}

function validateLabelsObject (labels, labelNames) {
  assert.equal(typeof labels, 'object', 'labels should be an object')

  const keys = Object.keys(labels)
  if (keys.length === 0) return

  assert.equal(keys.length, labelNames.length, 'wrong set of labels')
  for (const key of keys) {
    assert.ok(labelNames.includes(key), `${key} is not in initial labels set`)
  }
}

function hashLabelsObject (labels) {
  const keys = Object.keys(labels)
  if (keys.length === 0) return ''
  if (keys.length === 1) keys.sort()

  return keys.map((key) => `${key}:${labels[key]}`).join(',')
}

function copyObjectWithoutKey (obj, excludeKey) {
  const newObj = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key !== excludeKey) newObj[key] = value
  }

  return newObj
}

function diffTimeSeconds (time) {
  if (time === undefined) return process.hrtime()

  const diff = process.hrtime(time)
  return diff[0] + diff[1] / 1e9
}

module.exports = {
  parseMetricConfig,
  validateTimestamp,
  validateLabelsObject,
  hashLabelsObject,
  copyObjectWithoutKey,
  diffTimeSeconds
}
