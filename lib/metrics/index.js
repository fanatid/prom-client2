const processCPUSecondsTotal = require('./process_cpu_seconds_total')
const processOpenFDS = require('./process_open_fds')
const processMaxFDS = require('./process_max_fds')
const processResidentMemoryBytes = require('./process_resident_memory_bytes')
const processHeapBytes = require('./process_heap_bytes')
const processStartTimeSeconds = require('./process_start_time_seconds')
const nodejsVersion = require('./nodejs_version')

function create (metrics) {
  const metricsObjs = Object.values(metrics).filter((x) => x).map((createMetric) => createMetric())
  const metricsList = metricsObjs.map((obj) => obj.metric)

  function update () {
    for (const { update } of metricsObjs) update()
  }

  let intervalID
  function setUpdateInterval (delay) {
    if (intervalID) clearInterval(intervalID)
    intervalID = setInterval(update, delay).unref()
  }

  return {
    metrics,
    list: metricsList,
    update,
    setUpdateInterval,
    setup (register, delay) {
      register.registerMetrics(metricsList)
      this.setUpdateInterval(delay)
    }
  }
}

const processMetrics = create({
  processCPUSecondsTotal,
  processOpenFDS,
  processMaxFDS,
  processResidentMemoryBytes,
  processHeapBytes,
  processStartTimeSeconds
})

const nodejsMetrics = create({
  nodejsVersion
})

module.exports = {
  process: processMetrics,
  nodejs: nodejsMetrics,
  setup (register, delay) {
    processMetrics.setup(register, delay)
    nodejsMetrics.setup(register, delay)
  }
}
