const Gauge = require('../gauge')

module.exports = () => {
  const metric = new Gauge({
    name: 'process_cpu_seconds_total',
    help: 'Total user CPU time spent in seconds.'
  })

  function update () {
    const usage = process.cpuUsage()
    metric.set(usage.user + usage.system, Date.now())
  }

  return { metric, update }
}
