const { EventBuilder, Events } = require('shardclient');
const threadSchema = require('../db/thread_schema.js');

const HELPER_ROLE_ID = '1324454387023609917';

module.exports = new EventBuilder()
  .setName('trackHelper')
  .setTrigger(Events.MessageCreate)
  .setCallback(async (client, msg) => {
    if (msg.author.bot) return;

    console.log(`[TRACKHELPER] Message from ${msg.author.username} (${msg.author.id}) in channel ${msg.channel.id} (type: ${msg.channel.type})`);

    const channel = msg.channel;
    const parent = channel.parent;

    console.log(`[TRACKHELPER] Parent channel: ${parent?.name ?? 'none'} | Grandparent: ${parent?.parent?.name ?? 'none'}`);

    if (channel.type !== 11) {
      console.log(`[TRACKHELPER] Skipping — channel type ${msg.channel.type} is not a thread (11).`);
      return;
    }
    if (parent?.parent?.name.toLowerCase() !== 'support') {
      console.log(`[TRACKHELPER] Skipping — grandparent category is "${parent?.parent?.name ?? 'none'}", not "support".`);
      return;
    }

    console.log(`[TRACKHELPER] Fetching member ${msg.author.id} from guild...`);
    const member = await msg.guild?.members.fetch(msg.author.id).catch(err => {
      console.log(`[TRACKHELPER] Failed to fetch member: ${err.message}`);
      return null;
    });
    if (!member) return;

    const roleIds = member.roles.cache.map(r => `${r.name} (${r.id})`).join(', ');
    console.log(`[TRACKHELPER] ${msg.author.username} roles: ${roleIds}`);

    if (!member.roles.cache.has(HELPER_ROLE_ID)) {
      console.log(`[TRACKHELPER] Skipping — ${msg.author.username} does not have the Helper role (${HELPER_ROLE_ID}).`);
      return;
    }

    console.log(`[TRACKHELPER] Helper role confirmed. Updating DB for thread ${channel.id}...`);
    const updated = await threadSchema.updateOne({ threadId: channel.id }, { $addToSet: { helperIds: msg.author.id } });

    console.log(`[TRACKHELPER] DB result — matched: ${updated.matchedCount}, modified: ${updated.modifiedCount}`);
    if (updated.matchedCount === 0) {
      console.log(`[TRACKHELPER] No thread document found for ${channel.id} — OP hasn't posted yet.`);
    } else if (updated.modifiedCount === 0) {
      console.log(`[TRACKHELPER] ${msg.author.username} was already in helperIds, no change needed.`);
    } else {
      console.log(`[TRACKHELPER] Successfully recorded helper ${msg.author.username} (${msg.author.id}) in thread ${channel.id}.`);
    }
  });
