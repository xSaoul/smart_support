const { CommandBuilder } = require('shardclient');
const threadModel = require('../db/thread_schema.js');

module.exports = new CommandBuilder()
  .setName('solved')
  .setDescription('Apply the solved tag and lock the thread')
  .setCallback(async ctx => {
    const channel = ctx.channel;
    const forum = channel.parent;
    if (forum.parent?.name.toLowerCase() !== 'support' || channel.type !== 11)
      return ctx.interaction.reply({ content: 'This command can only be used in a support thread.', ephemeral: true });

    const tags = forum.availableTags;
    const currentTags = channel.appliedTags;
    const solvedTag = tags.find(tag => tag.name.toLowerCase() === 'solved');
    if (!solvedTag) {
      await ctx.interaction.reply({
        content: "Oops, something went wrong! Our team has been notified, and we'll work on fixing it. Please try again later.",
        ephemeral: true,
      });
      console.log('No solved tag found, does it exist?');
      return;
    }

    if (!currentTags.includes(solvedTag.id)) {
      const newTags = [solvedTag.id];
      channel.setAppliedTags(newTags);
    }
    await ctx.interaction.reply({ content: `This post has been marked as solved.\n-# Post closed <t:${Date.now().toString().slice(0, -3)}:R>.` });

    donationMsg(forumId);

    // Sleep for 5 seconds to let OP notice donation message
    await new Promise(r => setTimeout(r, 5000));

    channel.setArchived(true);
  });

async function donationMsg(forumId) {
  const helperLinks = {
    // OscarSix
    '211486447369322506': 'https://ko-fi.com/viridianlink',
    // Adiojoe
    '224057988749459456': 'https://www.buymeacoffee.com/Adiojoe',
    // Commo
    '130400218675019777': 'https://buymeacoffee.com/commo',
    // Tom Tech
    '357814326662529024': 'https://buymeacoffee.com/tomtech',
  };

  const threadDb = await threadModel.findOne({ threadId: forumId }).exec();

  let donationMsg = '';

  if (threadDb && threadDb.helperLinks) {
    const matchingLinks = threadDb.helperIds.filter(id => helperLinks[id]).map(id => `<@${id}>: ${helperLinks[id]}`);

    if (matchingLinks.length > 0) {
      donationMsg = '\n' + matchingLinks.join('\n');
    }
  }

  if (donationMsg) {
    await ctx.interaction.reply({
      content: `If you feel a helper has been particularly helperful in solving your support ticket please consider donating to them:${donationMsg}`,
    });
  }
}
