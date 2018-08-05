const test = require('tape')
const { Gauge } = require('../')
const { delay } = require('./util')

test('Gauge#constructor', (t) => {
  t.end()
})

test('Gauge#set', async (t) => {
  const gauge = new Gauge({ name: 'test', help: 'test' })
  t.same(gauge.getMetrics().values, [{ value: 0, timestamp: undefined, labels: {} }])

  gauge.set(42)
  t.same(gauge.getMetrics().values, [{ value: 42, timestamp: undefined, labels: {} }])

  gauge.set(4242, 1533363907450)
  t.same(gauge.getMetrics().values, [{ value: 4242, timestamp: 1533363907450, labels: {} }])

  await delay(10)
  gauge.set(424242)
  t.same(gauge.getMetrics().values, [{ value: 424242, timestamp: 1533363907450, labels: {} }])

  t.end()
})

test('Gauge#inc', (t) => {
  t.end()
})

test('Gauge#setToCurrentTime', (t) => {
  t.end()
})

test('Gauge#startTimer', (t) => {
  t.end()
})

test('Gauge#remove', (t) => {
  t.end()
})
