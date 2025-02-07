const { CommandBuilder } = require('shardclient');

module.exports = new CommandBuilder()
  .setName('faq')
  .setDescription('Searches the FAQ')
  .addStringOption(option => option.setName('query').setDescription('What are you looking for?').setAutocomplete(true).setRequired(true))
  .addUserOption(option => option.setName('target').setDescription('Select a user to direct to the FAQ').setRequired(false))
  .setAutoCallback(async ctx => {
    const focused = ctx.interaction.options.getFocused();
    const paths = new Map([
      ['General Setup', '#h-1-general-setup'],
      ['VPN and Networking', '#h-2-vpn-and-networking'],
      ['Radarr/Sonarr Integration', '#h-3-radarrsonarr-integration'],
      ['qBittorrent Issues', '#h-4-qbittorrent-issues'],
      ['GPU and Hardware Acceleration', '#h-5-gpu-and-hardware-acceleration'],
      ['Media Server Customizations', '#h-6-media-server-customizations'],
      ['Common Errors and Solutions', '#h-7-common-errors-and-solutions'],
      ['Advanced Topics', '#h-8-advanced-topics'],
    ]);

    const filtered = [...paths.entries()].filter(([key]) => key.toLowerCase().startsWith(focused.toLowerCase())).slice(0, 25);

    await ctx.interaction.respond(filtered.map(([key, value]) => ({ name: key, value })));
  })
  .setCallback(ctx => {
    const query = ctx.interaction.options.getString('query');
    const target = ctx.interaction.options.getUser('target');
    const targetString = target ? `${target} check out this FAQ entry!\n` : 'Check out this FAQ entry!\n';
    const wikiUrl = `https://wiki.serversatho.me/en/faq${query}`;
    ctx.interaction.reply({ content: `${targetString}${wikiUrl}` });
  });
