module.exports = {
  up(db) {
    return db.collection('user')
      .insertMany([{
        id: 1,
        fullname: 'John Lennon',
        email: 'john.lennon@beatles.com',
        password: 'john',
        verified: true,
      }]);
  },

  down(db) {
    return db.collection('user').drop();
  },
};
