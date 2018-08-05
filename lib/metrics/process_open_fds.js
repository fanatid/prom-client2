const fs = require('fs')
const Gauge = require('../gauge')

function create () {
  const metric = new Gauge({
    name: 'process_open_fds',
    help: 'Number of open file descriptors.'
  })

  function update () {
    fs.readdir('/proc/self/fd', (err, list) => {
      if (err) return
      metric.set(list.length - 1, Date.now())
    })
  }

  return { metric, update }
}

module.exports = process.platform === 'linux' ? create : null
