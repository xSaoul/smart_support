import { EventBuilder, Events } from 'shardclient';
import { checkIdleThreads } from '../../tasks/idleCheck.js';
import { checkClosingThreads } from '../../tasks/closeCheck.js';

module.exports = new EventBuilder()
  .setName('startIntervals')
  .setTrigger(Events.ClientReady)
  .setOnce(true)
  .setCallback(client => {
    setInterval(
      () => {
        checkIdleThreads(client);
        checkClosingThreads(client);
      },
      60 * 60 * 1000
    );
  });
