const Gauge = require('../gauge')

module.exports = () => {
  const metric = new Gauge({
    name: 'process_resident_memory_bytes',
    help: 'Resident memory size in bytes.'
  })

  function update () {
    const usage = process.memoryUsage()
    metric.set(usage.rss, Date.now())
  }

  return { metric, update }
}
