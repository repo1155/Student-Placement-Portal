const mongoose = require('mongoose');
const app = require('./app');
const { config, validateConfig } = require('./config');

async function start() {
  validateConfig();
  await mongoose.connect(config.mongoUri);
  const server = app.listen(config.port, () => {
    console.log(`Placement Portal API listening on port ${config.port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received; shutting down gracefully`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  console.error('Failed to start API:', error);
  process.exit(1);
});
