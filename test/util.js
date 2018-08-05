async function delay (timeout) {
  await new Promise((resolve) => setTimeout(resolve, timeout))
}

module.exports = {
  delay
}
