function escapeString (str) {
  return str.replace(/\n/g, '\\n').replace(/\\(?!n)/g, '\\\\')
}

function escapeLabelValue (str) {
  if (typeof str !== 'string') return str
  return escapeString(str).replace(/"/g, '\\"')
}

class Registry {
  constructor () {
    this.metrics = []
  }

  static formatMetric (metric) {
    const metrics = metric.getMetrics()
    const name = escapeString(metrics.name)

    let text = ''
    text += `# HELP ${name} ${escapeString(metrics.help)}\n`
    text += `# TYPE ${name} ${metrics.type}\n`

    for (const item of metrics.values) {
      const labels = Object.entries(item.labels).map(([key, value]) => `${key}="${escapeLabelValue(value)}"`)

      // Summary / Histogram can have metrics with additional postfix to name (_sum, _count, _bucket)
      let metricName = item.metricName ? escapeString(item.metricName) : name
      if (labels.length) metricName += `{${labels.join(',')}}`

      const value = Number.isFinite(item.value)
        ? item.value
        : `${item.value > 0 ? '+' : '-'}Inf`

      const timestamp = item.timestamp === undefined
        ? ''
        : ` ${item.timestamp}`

      text += `${metricName} ${value}${timestamp}\n`
    }

    return text
  }

  get contentType () {
    return 'text/plain; version=0.0.4; charset=utf-8'
  }

  registerMetric (metric) {
    for (const addedMetric of this.metrics) {
      if (addedMetric.name !== metric.name) continue

      throw new Error(`metric ${addedMetric.name} already added`)
    }

    this.metrics.push(metric)
  }

  registerMetrics (metrics) {
    for (const metric of metrics) this.registerMetric(metric)
  }

  resetMetrics () {
    for (const metric of this.metrics) metric.reset()
  }

  exposeText () {
    return this.metrics.map((metric) => Registry.formatMetric(metric)).join('\n')
  }
}

module.exports = Registry
