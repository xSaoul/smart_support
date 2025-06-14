const { EventBuilder, Events } = require('shardclient');
const threadSchema = require('../../db/thread_schema');

module.exports = new EventBuilder()
  .setName('idleTimer')
  .setTrigger(Events.MessageCreate)
  .setCallback(async (client, msg) => {
    if (msg.author.bot) return;
    const opId = msg.channel.ownerId;
    const threadId = msg.channel.id;
    const parent = msg.channel.parent;
    if (opId !== msg.author.id) return;
    if (parent.parent?.name.toLowerCase() !== 'support' || msg.channel.type !== 11) return;
    const result = await threadSchema.updateOne(
      { threadId: threadId, opId: opId },
      { $set: { lastPosted: new Date(Date.now()), reminderSent: false, closeScheduledTime: null } },
      { upsert: true }
    );

    if (result.upsertedCount === 1) console.log(`Thread ${threadId} for OP ${opId} has been created.`);
  });
