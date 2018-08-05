const Gauge = require('../gauge')

module.exports = () => {
  const metric = new Gauge({
    name: 'nodejs_version',
    help: 'Node.js version info.',
    labelNames: ['version', 'major', 'minor', 'patch']
  })

  const version = process.version.slice(1)
  const [major, minor, patch] = version.split('.').map((x) => parseInt(x, 10))
  metric.labels({ version, major, minor, patch }).set(1)

  return { metric, update () {} }
}
