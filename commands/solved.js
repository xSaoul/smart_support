const { CommandBuilder } = require('shardclient');

module.exports = new CommandBuilder()
  .setName('solved')
  .setDescription('Apply the solved tag and lock the thread')
  .setCallback(ctx => {
    const channel = ctx.channel;
    const forum = channel.parent;
    const tags = forum.availableTags;
    const currentTags = channel.appliedTags;
    const solvedTag = tags.find(tag => tag.name.toLowerCase() === 'solved');
    if (currentTags.includes(solvedTag.id)) return ctx.interaction.reply({ content: 'This post is already marked as solved.', ephemeral: true });
    const newTags = [solvedTag.id, ...channel.appliedTags];
    channel.setAppliedTags(newTags);
    ctx.interaction.reply({ content: `This post has been marked as solved.\n-# Post closed <t:${Date.now().toString().slice(0, -3)}:R>.` });
    channel.setArchived(true);
  });
