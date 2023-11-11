// Used to simulate slow responses for testing purpose
// Use: await sleep(milliseconds);

module.exports = {
  sleep: (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  }),
};
