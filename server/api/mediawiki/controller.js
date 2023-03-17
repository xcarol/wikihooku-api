const wiki = require('../../services/wiki');

const controller = {
  page(req, res, next) {
    wiki.request('https://www.wikipedia.org/w/api.php'
      + '?action=parse'
      + '&format=json'
      + '&prop=wikitext'
      + `&pageid=${req.params.pageid}`, res, next);
  },
  search(req, res, next) {
    wiki.request('https://www.wikipedia.org/w/api.php'
      + '?action=query'
      + '&format=json'
      + '&formatversion=2'
      + '&list=search'
      + '&prop=info'
      + '&inprop=displaytitle'
      + `&srsearch=${req.params.text}`
      + `&sroffset=${req.params.offset}`
      + '&srinfo=&srprop=', res, next);
  },
  searchPerson(req, res, next) {
    wiki.request('https://www.wikipedia.org/w/api.php'
      + '?action=query'
      + '&generator=search'
      + `&gsrsearch=${req.params.text}`
      + '&format=json'
      + '&formatversion=2'
      + '&prop=revisions'
      + '&rvprop=content'
      + '&rvsection=0'
      + '&rvslots=main', res, next);
  },
};

module.exports = controller;
