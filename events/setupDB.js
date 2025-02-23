const { setupDatabase } = require('../tasks/schemas');
const { EventBuilder, Events } = require('shardclient');

module.exports = new EventBuilder()
  .setName('setupDB')
  .setTrigger(Events.ClientReady)
  .setOnce(true)
  .setCallback(async () => {
    await setupDatabase();
  });
