const Benchmark = require('benchmark')
const prom = require('prom-client')
const prom2 = require('../')

function benchmarkGaugeSet () {
  const suite = new Benchmark.Suite('Benchmark Gauge#set')

  suite
    .add('prom-client', (() => {
      const register = new prom.Registry()
      const gauge = new prom.Gauge({ name: 'test', help: 'test', registers: [register] })
      return () => gauge.set(42)
    })())
    .add('prom-client2', (() => {
      const register = new prom2.Registry()
      const gauge = new prom2.Gauge({ name: 'test', help: 'test', registers: [register] })
      return () => gauge.set(42)
    })())
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function () { console.log(`${this.name}: fastest is ${this.filter('fastest').map('name')}`) })
    .run()
}

function benchmarkGaugeLabelsSet () {
  const suite = new Benchmark.Suite('Benchmark Gauge#labels + set call')

  suite
    .add('prom-client', (() => {
      const register = new prom.Registry()
      const gauge = new prom.Gauge({ name: 'test', help: 'test', labelNames: ['method', 'statusCode'], registers: [register] })
      return () => gauge.labels('GET', '200').set(42)
    })())
    .add('prom-client2', (() => {
      const register = new prom2.Registry()
      const gauge = new prom2.Gauge({ name: 'test', help: 'test', labelNames: ['method', 'statusCode'], registers: [register] })
      return () => gauge.labels({ method: 'GET', statusCode: '200' }).set(42)
    })())
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function () { console.log(`${this.name}: fastest is ${this.filter('fastest').map('name')}`) })
    .run()
}

function benchmarkGaugeStartTimer () {
  const suite = new Benchmark.Suite('Benchmark Gauge#startTimer')

  suite
    .add('prom-client', (() => {
      const register = new prom.Registry()
      const gauge = new prom.Gauge({ name: 'test', help: 'test', labelNames: ['method', 'statusCode'], registers: [register] })
      return () => gauge.startTimer({ method: 'GET' })({ statusCode: '200' })
    })())
    .add('prom-client2', (() => {
      const register = new prom2.Registry()
      const gauge = new prom2.Gauge({ name: 'test', help: 'test', labelNames: ['method', 'statusCode'], registers: [register] })
      return () => gauge.startTimer({ method: 'GET' })({ statusCode: '200' })
    })())
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function () { console.log(`${this.name}: fastest is ${this.filter('fastest').map('name')}`) })
    .run()
}

function benchmarkRegistryExpose () {
  const suite = new Benchmark.Suite('Benchmark Registry#exposeText')

  suite
    .add('prom-client', (() => {
      const register = new prom.Registry()
      register.registerMetric(new prom.Gauge({ name: 'test', help: 'test', labelNames: ['method', 'statusCode'] }))
      return () => register.metrics()
    })())
    .add('prom-client2', (() => {
      const register = new prom2.Registry()
      register.registerMetric(new prom2.Gauge({ name: 'test', help: 'test', labelNames: ['method', 'statusCode'] }))
      return () => register.exposeText()
    })())
    .on('cycle', (event) => console.log(String(event.target)))
    .on('complete', function () { console.log(`${this.name}: fastest is ${this.filter('fastest').map('name')}`) })
    .run()
}

benchmarkGaugeSet()
benchmarkGaugeLabelsSet()
benchmarkGaugeStartTimer()
benchmarkRegistryExpose()
