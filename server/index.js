const dotenv = require('dotenv');
const restify = require('restify');
const pino = require('restify-pino-logger');
const { Router } = require('restify-router');
const corsMiddleware = require('restify-cors-middleware2');
const i18next = require('i18next');
const i18nMiddleware = require('i18next-http-middleware');
const i18nFsBackend = require('i18next-fs-backend');
const routes = require('./routes');
const database = require('./services/database');
const logger = require('./services/logger');

if (process.env.NODE_ENV !== 'production') {
  const path = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}.local` : '.env';
  dotenv.config({ path });
}

const cors = corsMiddleware({
  origins: process.env.ALLOW_ORIGINS
    ? process.env.ALLOW_ORIGINS.split(',')
    : [],
  allowHeaders: process.env.ALLOW_HEADERS
    ? process.env.ALLOW_HEADERS.split(',')
    : [],
  exposeHeaders: process.env.EXPOSE_HEADERS
    ? process.env.EXPOSE_HEADERS.split(',')
    : [],
});

i18next
  .use(i18nMiddleware.LanguageDetector)
  .use(i18nFsBackend)
  .init({
    preload: ['en', 'es', 'ca'],
    saveMissing: true,
    backend: {
      loadPath: './locales/{{lng}}.json',
      addPath: './locales/{{lng}}.missing.json',
    },
  });

const log = logger.init({
  level: process.env.LOG_LEVEL || 'info',
});

database.init();

const server = restify.createServer({
  name: 'wikihooku-api',
  version: '0.1.0',
});

server.pre(cors.preflight);
server.use(cors.actual);
server.use(
  i18nMiddleware.handle(i18next, {
    order: ['cookie', 'querystring', 'header'],
  }),
);
server.use(pino(logger.getLoggerOpts()));
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.gzipResponse());

const router = new Router();
router.add('/api', routes);
router.applyRoutes(server);

server.listen(process.env.PORT, () => {
  log.info(`'${server.name}' listening at ${server.url}`);
});

module.exports = server;
