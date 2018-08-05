const Gauge = require('../gauge')

module.exports = () => {
  const metric = new Gauge({
    name: 'process_heap_bytes',
    help: 'Process heap size in bytes.'
  })

  function update () {
    const usage = process.memoryUsage()
    metric.set(usage.heapTotal, Date.now())
  }

  return { metric, update }
}
