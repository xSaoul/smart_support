const { EventBuilder, Events } = require('shardclient');
const db = require('../../mariadb');
module.exports = new EventBuilder()
  .setName('idleTimer')
  .setTrigger(Events.MessageCreate)
  .setCallback(async (client, msg) => {
    if (msg.author.bot) return;
    const opId = msg.channel.ownerId;
    const threadId = msg.channel.id;
    const parent = msg.channel.parent;
    if (opId !== '439601142528344065') return;
    if (opId !== msg.author.id) return;
    if (parent.parent?.name.toLowerCase() !== 'support' || msg.channel.type !== 11) return;
    const [result] = await db.execute(
      `
      INSERT INTO thread_timers (thread_id, op_id, last_posted, reminder_sent)
      VALUES (?, ?, NOW(), FALSE)
      ON DUPLICATE KEY UPDATE last_posted = NOW(), reminder_sent = FALSE, close_scheduled_time = NULL
      `,
      [threadId, opId]
    );
    if (result.affectedRows === 1) console.log(`Thread ${threadId} for OP ${opId} has been created.`);
  });
