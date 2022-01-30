const wiki = require('../../services/wiki');

const controller = {
  async search(req, res, next) {
    wiki.request('https://www.wikipedia.org/w/api.php'
      + '?action=opensearch'
      + '&formatversion=2'
      + '&format=json'
      + `&limit=${req.params.limit}`
      + `&search=${req.params.text}`, res, next);
  },
  async page(req, res, next) {
    wiki.request(`https://www.wikipedia.org/w/api.php?action=parse&prop=wikitext&format=json&page=${req.params.text}`, res, next);
  },
};

module.exports = controller;
