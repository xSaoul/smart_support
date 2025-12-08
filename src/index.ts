import { ShardClient, ClientOptions } from 'shardclient';
import { GatewayIntentBits } from 'discord.js';
import * as mongoose from './db/mongoose.js';
mongoose.login();

const client = new ShardClient(
  new ClientOptions()
    .setGuildCommandsId('1120465621554040942')
    .setDevelopers('439601142528344065')
    .setIntents([GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers])
);

client.login();
