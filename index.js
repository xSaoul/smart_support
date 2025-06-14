const { ShardClient, ClientOptions } = require('shardclient');
const { GatewayIntentBits } = require('discord.js');
const mongoose = require('./db/mongoose');
mongoose.login();

const client = new ShardClient(
  new ClientOptions()
    .setGuildCommandsId('1120465621554040942')
    .setDevelopers('439601142528344065')
    .setIntents([GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers])
);

client.login();
