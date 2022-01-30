const chai = require('chai');
const request = require('supertest');

const Server = require('../../../../server');
const httpStatuses = require('../../../../server/consts/httpStatuses');

describe('Feedback', () => {
  it('sends a feedback email', async () => {
    const response = await request(Server)
      .post('/api/feedback')
      .send({
        email: 'wikihookutest@xicra.com',
        feedback: 'I love WikiHooku',
      });

    chai.expect(response.statusCode).to.eql(httpStatuses.NO_CONTENT);
  });

  it('returns an error if any missing parameter', async () => {
    const res = await request(Server)
      .post('/api/feedback')
      .send({});
    chai.expect(res.statusCode).to.equal(httpStatuses.BAD_REQUEST);
  });
});
