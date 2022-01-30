const chai = require('chai');
const spies = require('chai-spies');

const router = require('../../../../server/api/feedback/router');

before(() => {
  chai.use(spies);
});

describe('Feedback Router', () => {
  it('has a method to send user feedback', () => {
    chai.expect(router.routes.post.filter((route) => route.options.path === '').length).to.equal(1);
  });
});
