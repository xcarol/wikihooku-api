const http = require('https');
const url = require('url');

exports.request = (urlToRequest, response, next) => {
  const chunks = [];
  const reqURL = new URL(urlToRequest);

  http.request(reqURL, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      if (url.parse(res.headers.location).hostname) {
        this.request(res.headers.location, response, next);
      } else {
        next();
      }
    } else {
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });
      res.on('end', () => {
        response.sendRaw(Buffer.concat(chunks));
      });
    }
  }).end();
};
