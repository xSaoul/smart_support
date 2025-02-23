const db = require('../mariadb');
async function checkClosingThreads(client) {
  const [rows] = await db.execute(
    `
    SELECT thread_id, op_id, close_scheduled_time FROM thread_timers
    WHERE close_scheduled_time IS NOT NULL
    AND close_scheduled_time < NOW()
    `
  );

  console.log(`Found ${rows.length} thread(s) to check for closable status.`);

  if (rows.length === 0) return;

  for (const { thread_id, op_id } of rows) {
    try {
      const thread = await client.channels.fetch(thread_id);
      if (thread) {
        await thread.send({ content: `<@${op_id}> Your thread has been closed due to inactivity.` });
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
      await db.execute('DELETE FROM thread_timers WHERE thread_id = ?', [thread_id]);
    } catch (err) {
      console.error(`Failed to close thread ${thread_id}:`, err);
    }
  }
}
module.exports = { checkClosingThreads };
