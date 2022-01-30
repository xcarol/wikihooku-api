const chai = require('chai');
const spies = require('chai-spies');

const router = require('../../../../server/api/user/router');

before(() => {
  chai.use(spies);
});

describe('User Router', () => {
  it('has a method to show specific user', () => {
    chai.expect(router.routes.get.filter((route) => route.options.path === '/:userid').length).to.equal(1);
  });
  it('has a method to create a user', () => {
    chai.expect(router.routes.post.filter((route) => route.options.path === '').length).to.equal(1);
  });
  it('has a method to update a user', () => {
    chai.expect(router.routes.put.filter((route) => route.options.path === '').length).to.equal(1);
  });
  it('has a method to login a user', () => {
    chai.expect(router.routes.post.filter((route) => route.options.path === '/login').length).to.equal(1);
  });
  it('has a method to confirm a user', () => {
    chai.expect(router.routes.post.filter((route) => route.options.path === '/confirm').length).to.equal(1);
  });
  it('has a method to recover a user password', () => {
    chai.expect(router.routes.post.filter((route) => route.options.path === '/recoverpass').length).to.equal(1);
  });
  it('has a method to reset a user password', () => {
    chai.expect(router.routes.post.filter((route) => route.options.path === '/resetpass').length).to.equal(1);
  });
});
