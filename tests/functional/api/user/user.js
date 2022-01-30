const chai = require('chai');
const request = require('supertest');
const mongoose = require('mongoose');

const Server = require('../../../../server');
const httpStatuses = require('../../../../server/consts/httpStatuses');
const tokenizer = require('../../../../server/services/tokenizer');
const service = require('../../../../server/services/user');
const UserSchema = require('../../../../server/models/User');
const users = require('../../../data/users');

const User = mongoose.model('User', UserSchema);
const testUsers = JSON.parse(JSON.stringify(users));
const [userOne, userTwo] = testUsers;

let mongusers;
let encryptedPassword;
const unencryptedPassword = '123456';

mongoose.Promise = global.Promise;

async function login(username) {
  const credentials = { username, password: unencryptedPassword };

  const response = await request(Server)
    .post('/api/user/login')
    .send(credentials);

  chai.expect(response.statusCode).to.equal(httpStatuses.ACCEPTED);

  return JSON.parse(response.text);
}

async function addUsers() {
  mongusers = [];
  users.forEach((user) => {
    const userToAdd = { ...user, createdAt: new Date() };
    const monguser = new User(userToAdd);
    monguser.password = encryptedPassword;
    monguser.confirmationToken = '';

    mongusers.push(monguser.save());
  });

  return Promise.all(mongusers);
}

async function getRecoverToken(monguser) {
  const user = await User.findOne({ email: monguser.email });
  return user.recoverPasswordToken;
}

before(async () => {
  process.env.SALT = '$2b$10$FyD8sV/mOulEuHa.In9OS.';
  encryptedPassword = await service.encryptPassword(unencryptedPassword);
});

describe('User', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('returns requested user', async () => {
    const addedUsers = await addUsers();

    const authUser = await login(userOne.email);
    const response = await request(Server)
      .get(`/api/user/${addedUsers[0].id}`)
      .set('Authorization', `Bearer ${authUser.token}`);

    chai.expect(response.statusCode).to.eql(httpStatuses.OK);
    chai.expect(response.body.user._id).to.eql(addedUsers[0].id);
  });

  it('returns error if user requested other\'s user account', async () => {
    const addedUsers = await addUsers();

    const authUser = await login(userOne.email);
    const response = await request(Server)
      .get(`/api/user/${addedUsers[1].id}`)
      .set('Authorization', `Bearer ${authUser.token}`);

    chai.expect(response.statusCode).to.eql(httpStatuses.FORBIDDEN);
  });

  it('returns error if anonymous user requests for a user account', async () => {
    const addedUsers = await addUsers();

    const response = await request(Server)
      .get(`/api/user/${addedUsers[1].id}`);

    chai.expect(response.statusCode).to.eql(httpStatuses.UNAUTHORIZED);
  });

  it('creates a new user', async () => {
    const res = await request(Server)
      .post('/api/user')
      .send(userOne);
    chai.expect(res.statusCode).to.equal(httpStatuses.CREATED);
  });

  it('returns an error if user cannot be created', async () => {
    const [firstUser] = users;
    const user = { ...firstUser };
    user.fullname = { a: 1, b: 2 };
    const res = await request(Server)
      .post('/api/user')
      .send(user);
    chai.expect(res.statusCode).to.equal(httpStatuses.INTERNAL_SERVER_ERROR);
  });

  it('returns an error if any missing parameter on creation', async () => {
    const [firstUser] = users;
    const user = { ...firstUser };
    user.fullname = null;
    const res = await request(Server)
      .post('/api/user')
      .send(user);
    chai.expect(res.statusCode).to.equal(httpStatuses.BAD_REQUEST);
  });

  it('returns an error if user already exists', async () => {
    const [firstUser] = users;
    const res = await request(Server)
      .post('/api/user')
      .send(firstUser);
    chai.expect(res.statusCode).to.equal(httpStatuses.CREATED);
    const res2 = await request(Server)
      .post('/api/user')
      .send(firstUser);
    chai.expect(res2.statusCode).to.equal(httpStatuses.CONFLICT);
  });

  it('updates an existing user', async () => {
    const addedUsers = await addUsers();
    const updateUser = { _id: addedUsers[0].id, ...userOne };
    const authUser = await login(userOne.email);
    const res = await request(Server)
      .put('/api/user')
      .send(updateUser)
      .set('Authorization', `Bearer ${authUser.token}`);
    chai.expect(res.statusCode).to.equal(httpStatuses.NO_CONTENT);
  });

  it('returns error if user updates other\'s user account', async () => {
    const addedUsers = await addUsers();
    const updateUser = { _id: addedUsers[1].id, ...userOne };
    const authUser = await login(userOne.email);
    const res = await request(Server)
      .put('/api/user')
      .send(updateUser)
      .set('Authorization', `Bearer ${authUser.token}`);
    chai.expect(res.statusCode).to.equal(httpStatuses.FORBIDDEN);
  });

  it('updates the password of an existing user', async () => {
    const addedUsers = await addUsers();
    const updateUser = {
      _id: addedUsers[0].id,
      oldPassword: unencryptedPassword,
      newPassword: 'another password',
      ...userOne,
    };
    const authUser = await login(userOne.email);
    const res = await request(Server)
      .put('/api/user')
      .send(updateUser)
      .set('Authorization', `Bearer ${authUser.token}`);
    chai.expect(res.statusCode).to.equal(httpStatuses.NO_CONTENT);
  });

  it('returns an error if any missing parameter on update', async () => {
    const addedUsers = await addUsers();
    const updateUser = {
      _id: addedUsers[0].id,
      newPassword: 'new-password',
      oldPassword: 'invalid-password',
      ...userOne,
    };
    const authUser = await login(userOne.email);
    const res = await request(Server)
      .put('/api/user')
      .send(updateUser)
      .set('Authorization', `Bearer ${authUser.token}`);
    chai.expect(res.statusCode).to.equal(httpStatuses.BAD_REQUEST);
  });

  it('confirms a user registration', async () => {
    await service.addUser(userOne);
    const userToConfirm = await service.findUserByEmail(userOne.email);
    const res = await request(Server)
      .post('/api/user/confirm')
      .send(userToConfirm);
    chai.expect(res.statusCode).to.equal(httpStatuses.ACCEPTED);
  });

  it('checks token ownership at the user registration', async () => {
    await service.addUser(userOne);
    const userToConfirm = await service.findUserByEmail(userOne.email);
    userToConfirm.confirmationToken = tokenizer.getConfirmationToken(userTwo);
    const res = await request(Server)
      .post('/api/user/confirm')
      .send(userToConfirm);
    chai.expect(res.statusCode).to.equal(httpStatuses.NOT_FOUND);
  });

  it('logs the user in', async () => {
    await addUsers();
    const credentials = { username: userOne.email, password: unencryptedPassword };
    const res = await request(Server)
      .post('/api/user/login')
      .send(credentials);
    chai.expect(res.statusCode).to.equal(httpStatuses.ACCEPTED);
  });

  it('returns an error if user cannot log in', async () => {
    await addUsers();
    const credentials = { username: userOne.email, password: 'another password' };
    const res = await request(Server)
      .post('/api/user/login')
      .send(credentials);
    chai.expect(res.statusCode).to.equal(httpStatuses.UNAUTHORIZED);
  });

  it('sends a recover password email', async () => {
    await addUsers();
    const res = await request(Server)
      .post('/api/user/recoverpass')
      .send({ email: userOne.email });
    chai.expect(res.statusCode).to.equal(httpStatuses.NO_CONTENT);
  });

  it('returns an error if email is missing when sending recover password email', async () => {
    const res = await request(Server)
      .post('/api/user/recoverpass');
    chai.expect(res.statusCode).to.equal(httpStatuses.BAD_REQUEST);
  });

  it('doesn\'t return an error if user doesn\'t exist when sending recover password email', async () => {
    const res = await request(Server)
      .post('/api/user/recoverpass')
      .send({ email: 'nouser@email.com' });
    chai.expect(res.statusCode).to.equal(httpStatuses.NO_CONTENT);
  });

  it('reset user password', async () => {
    const addedUsers = await addUsers();
    const [addedUser] = addedUsers;
    const resRecover = await request(Server)
      .post('/api/user/recoverpass')
      .send({ email: userOne.email });
    chai.expect(resRecover.statusCode).to.equal(httpStatuses.NO_CONTENT);
    const resReset = await request(Server)
      .post('/api/user/resetpass')
      .send({ email: addedUser.email, password: userTwo.password, token: await getRecoverToken(addedUser) });
    chai.expect(resReset.statusCode).to.equal(httpStatuses.OK);
    const response = JSON.parse(resReset.res.text);
    chai.expect(response.user.recoverPasswordToken).to.eql('');
    chai.expect(response.token.length).to.be.greaterThan(0);
  });

  it('returns an error if email is missing when reseting password', async () => {
    const res = await request(Server)
      .post('/api/user/recoverpass');
    chai.expect(res.statusCode).to.equal(httpStatuses.BAD_REQUEST);
  });
});
