module.exports = {
  up(db) {
    return db.collection('collection')
      .insertMany([
        {
          name: 'Musicians',
          items: [],
        },
        {
          type: 'Writers',
          items: [],
        },
        {
          type: 'Football Players',
          items: [],
        },
      ]);
  },

  down(db) {
    return db.collection('collection').drop();
  },
};
