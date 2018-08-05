const Gauge = require('../gauge')

module.exports = () => {
  const metric = new Gauge({
    name: 'process_start_time_seconds',
    help: 'Start time of the process since unix epoch in seconds.'
  })
  metric.set(Math.round(Date.now() / 1000 - process.uptime()))

  return { metric, update () {} }
}
