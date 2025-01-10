const { EventBuilder, Events } = require('shardclient');
const cooldowns = new Map();
module.exports = new EventBuilder()
  .setName('cmdSuggestion')
  .setTrigger(Events.MessageCreate)
  .setCallback((client, msg) => {
    if (msg.author.bot) return;
    if (msg.channel.ownerId !== msg.author.id) return;
    if (cooldowns.has(msg.author.id)) {
      const expiration = cooldowns.get(msg.author.id);
      if (Date.now() < expiration) return;
    }
    const tests = ['thanks', 'thank you', 'thanks!', 'thank you!', 'ty', 'ty!', 'tyvm', 'tyvm!'];
    const found = tests.some(test => msg.content.toLowerCase() === test);
    if (!found) return;
    const parent = msg.channel.parent;
    if (parent.parent?.name.toLowerCase() !== 'support' || msg.channel.type !== 11) return;
    cooldowns.set(msg.author.id, Date.now() + 300000);
    setTimeout(() => cooldowns.delete(msg.author.id), 300000);
    const cmd = client.commands.find(cmd => cmd.name === 'solved');
    msg.reply({ content: `<:tree_end:951969115264913528> Suggested command: </solved:${cmd.id}>` });
  });
