const { EventBuilder, Events } = require('shardclient');
const { checkIdleThreads } = require('../../tasks/idleCheck');
const { checkClosingThreads } = require('../../tasks/closeCheck');
module.exports = new EventBuilder()
  .setName('startIntervals')
  .setTrigger(Events.ClientReady)
  .setOnce(true)
  .setCallback(client => {
    setInterval(() => {
      checkIdleThreads(client);
      checkClosingThreads(client);
    }, 30 * 1000);
  });
