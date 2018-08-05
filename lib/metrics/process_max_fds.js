const fs = require('fs')
const Gauge = require('../gauge')

function create () {
  const metric = new Gauge({
    name: 'process_max_fds',
    help: 'Maximum number of open file descriptors.'
  })

  function update () {
    fs.readFile('/proc/sys/fs/file-max', 'utf8', (err, text) => {
      if (err) return
      metric.set(parseInt(text, 10), Date.now())
    })
  }

  return { metric, update }
}

module.exports = process.platform === 'linux' ? create : null
