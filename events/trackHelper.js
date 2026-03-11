const { EventBuilder, Events } = require('shardclient');
const threadSchema = require('../../db/thread_schema');

const HELPER_ROLE_ID = '1324454387023609917';

module.exports = new EventBuilder()
  .setName('trackHelper')
  .setTrigger(Events.MessageCreate)
  .setCallback(async (client, msg) => {
    if (msg.author.bot) return;

    const channel = msg.channel;
    const parent = channel.parent;
    if (parent?.parent?.name.toLowerCase() !== 'support' || channel.type !== 11) return;

    const member = msg.member ?? (await msg.guild?.members.fetch(msg.author.id).catch(() => null));
    if (!member?.roles.cache.has(HELPER_ROLE_ID)) return;

    const updated = await threadSchema.updateOne({ threadId: channel.id }, { $addToSet: { helperIds: msg.author.id } });

    if (updated.matchedCount !== 0) {
      console.log(`[TRACKHELPER] Recorded helper ${msg.author.username} (${msg.author.id}) in thread ${channel.id}.`);
    }
  });
