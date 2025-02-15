const db = require('../mariadb');
async function checkClosingThreads(client) {
  const [rows] = await db.execute(`
    SELECT thread_id, op_id, close_scheduled_time FROM thread_timers
    WHERE close_scheduled_time IS NOT NULL
    AND close_scheduled_time < NOW()
    `);

  for (const { thread_id, op_id } of rows) {
    try {
      const thread = await client.channels.fetch(thread_id);
      if (thread) {
        await thread.send({ content: `<@${op_id}> Thread has been closed due to inactivity.` });
        await thread.setArchived(true);
        console.log(`Thread ${thread_id} closed due to inactivity.`);
      }
      await db.execute('DELETE FROM thread_timers WHERE thread_id = ?', [thread_id]);
    } catch (err) {
      console.error(`Failed to close thread ${thread_id}:`, err);
    }
  }
}
module.exports = { checkClosingThreads };
