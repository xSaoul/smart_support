const { CommandBuilder } = require('shardclient');

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
    channel.setArchived(true);
  });
