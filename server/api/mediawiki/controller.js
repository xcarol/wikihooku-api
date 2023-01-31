const wiki = require('../../services/wiki');

const controller = {
  search(req, res, next) {
    wiki.request('https://www.wikipedia.org/w/api.php'
      + '?action=query'
      + '&format=json'
      + '&list=search'
      + '&utf8=1'
      + '&srnamespace=0'
      + '&srprop='
      + `&srsearch=${req.params.text}`, res, next);
  },
  page(req, res, next) {
    wiki.request(`https://www.wikipedia.org/w/api.php?action=parse&prop=wikitext&format=json&pageid=${req.params.pageid}`, res, next);
  },
};

module.exports = controller;
