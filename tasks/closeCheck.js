const db = require('../mariadb');
const USER_ID = '439601142528344065';
async function checkClosingThreads(client) {
  const [rows] = await db.execute(
    `
    SELECT thread_id, op_id, close_scheduled_time FROM thread_timers
    WHERE close_scheduled_time IS NOT NULL
    AND close_scheduled_time < NOW()
    AND op_id = ?
  `,
    [USER_ID]
  );

  console.log(`Found ${rows.length} thread(s) to check for closable status.`);

  if (rows.length === 0) return;

  for (const { thread_id, op_id } of rows) {
    try {
      const thread = await client.channels.fetch(thread_id);
      if (thread) {
        await thread.send({ content: `<@${op_id}> Your thread has been closed due to inactivity.` });
        await thread.setArchived(true);
      }
      await db.execute('DELETE FROM thread_timers WHERE thread_id = ?', [thread_id]);
    } catch (err) {
      console.error(`Failed to close thread ${thread_id}:`, err);
    }
  }
}
module.exports = { checkClosingThreads };
