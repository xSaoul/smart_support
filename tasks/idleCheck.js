const schema = require('../db/thread_schema');

async function checkIdleThreads(client) {
  const rows = await schema.find({ reminderSent: false, lastPosted: { $lt: new Date(Date.now() - 120 * 1000) } });

  console.log(`Found ${rows.length} thread(s) to check for idle status.`);

  if (rows.length === 0) return;

  for (const { threadId, opId } of rows) {
    try {
      const thread = await client.channels.fetch(threadId);
      if (!thread) {
        console.log(`Thread ${threadId} not found. Deleting from database.`);
        await schema.deleteOne({ threadId: threadId });
        continue;
      }

      const lastMessage = await thread.messages.fetch({ limit: 1 });
      const lastMessageAuthor = lastMessage.first()?.author.id;
      if (lastMessageAuthor === opId) {
        await schema.updateOne({ threadId, opId }, { $set: { lastPosted: new Date(), closeScheduledTime: null } });
        continue;
      }
      const forum = thread.parent;
      const tags = forum.availableTags;
      const currentTags = thread.appliedTags;
      const waitingTag = tags.find(tag => tag.name.toLowerCase() === 'waiting');
      if (waitingTag && currentTags.includes(waitingTag.id)) continue;
      const solvedTag = tags.find(tag => tag.name.toLowerCase() === 'solved');
      if (solvedTag && currentTags.includes(solvedTag.id)) continue;
      if (thread.archived) continue;
      await thread.send({
        content: `<@${opId}> Your thread has been idle for over 48 hours. 
            <:tree_end:951969115264913528> If this issue is not resolved, please reply within 24hrs to prevent this thread from closing.`,
      });
      await schema.updateOne(
        { threadId: threadId, opId: opId },
        { $set: { reminderSent: true, closeScheduledTime: new Date(Date.now() + 60 * 1000) } }
      );
    } catch (err) {
      console.error(`Failed to send message in thread ${threadId}:`, err);
    }
  }
}

module.exports = { checkIdleThreads };
