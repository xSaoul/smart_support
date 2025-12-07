const { EventBuilder, Events } = require('shardclient');
const { checkIdleThreads } = require('../../tasks/idleCheck');
const { checkClosingThreads } = require('../../tasks/closeCheck');
const { pollPatreon } = require('../../tasks/pollPatreon');

module.exports = new EventBuilder()
  .setName('startIntervals')
  .setTrigger(Events.ClientReady)
  .setOnce(true)
  .setCallback(client => {
    pollPatreon(client);
    setInterval(
      () => {
        checkIdleThreads(client);
        checkClosingThreads(client);
        pollPatreon(client);
      },
      60 * 60 * 1000 // 1 hour
    );
  });
