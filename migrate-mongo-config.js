const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') {
  const path = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}.local` : '.env';
  dotenv.config({ path });
}

const config = {
  mongodb: {
    url: process.env.MONGODB_URI,
    databaseName: process.env.DATABASE,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },

  migrationsDir: 'migrations',
  changelogCollectionName: 'changelog',
};

module.exports = config;
