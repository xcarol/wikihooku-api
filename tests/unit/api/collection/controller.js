const chai = require('chai');
const spies = require('chai-spies');

const httpStatuses = require('../../../../server/consts/httpStatuses');

const service = require('../../../../server/services/collection');
const logger = require('../../../../server/services/logger');
const controller = require('../../../../server/api/collection/controller');

let response;

before(() => {
  chai.use(spies);
});

describe('Collection Controller', () => {
  beforeEach(() => {
    logger.init();
    response = {
      log: logger.getLogger(),
      json: () => {},
    };
  });

  afterEach(() => {
    chai.spy.restore();
  });

  it('returns error if no collection specified', async () => {
    const req = {};
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.BAD_REQUEST);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findCollectionById', () => Promise.resolve());

    await controller.collection(req, response);
    chai.expect(service.findCollectionById).to.not.have.been.called();
  });

  it('return error if cannot find collection specified', async () => {
    const req = {
      params: {
        collectionid: 'Philosophers',
      },
    };
    chai.spy.on(response, 'json', (error) => {
      chai.expect(response.statusCode).to.equal(httpStatuses.NOT_FOUND);
      chai.expect(typeof error.message).to.equal('string');
    });

    chai.spy.on(service, 'findCollectionById', () => Promise.resolve());

    await controller.collection(req, response);
    chai.expect(service.findCollectionById).to.have.been.called();
  });
});
