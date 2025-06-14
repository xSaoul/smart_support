const schema = require('../db/thread_schema');

async function checkClosingThreads(client) {
  const rows = await schema.find({ closeScheduledTime: { $ne: null, $lt: new Date() } });

  console.log(`Found ${rows.length} thread(s) to check for closable status.`);

  if (rows.length === 0) return;

  for (const { threadId, opId } of rows) {
    try {
      const thread = await client.channels.fetch(threadId);
      if (thread) {
        await thread.send({ content: `<@${opId}> Your thread has been closed due to inactivity.` });
        const forum = thread.parent;
        const tags = forum.availableTags;
        const currentTags = thread.appliedTags;
        const idleTag = tags.find(tag => tag.name.toLowerCase() === 'idle');
        if (!idleTag) {
          console.log('No idle tag found, does it exist?');
        } else if (currentTags.includes(idleTag.id)) {
          console.log('Thread already has idle tag, skipping');
        } else {
          const newTags = [idleTag.id];
          await thread.setAppliedTags(newTags);
        }
        await thread.setArchived(true);
      }
      await schema.deleteOne({ threadId });
    } catch (err) {
      console.error(`Failed to close thread ${threadId}:`, err);
    }
  }
}
module.exports = { checkClosingThreads };
