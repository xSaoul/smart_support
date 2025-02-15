const { EventBuilder, Events } = require('shardclient');
const checkIdleThreads = require('../../tasks/idleCheck');
const checkClosingThreads = require('../../tasks/closeThreads');
module.exports = new EventBuilder()
  .setName('startIntervals')
  .setTrigger(Events.ClientReady)
  .setOnce(true)
  .setCallback(client => {
    setInterval(() => {
      console.log('Checking idle and closing threads...');
      checkIdleThreads(client);
      checkClosingThreads(client);
    }, 60 * 1000);
  });
