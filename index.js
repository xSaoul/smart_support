const { ShardClient, ClientOptions } = require('shardclient');
const client = new ShardClient(new ClientOptions().setGuildCommandsId('1120465621554040942').setDevelopers('439601142528344065'));
client.login();
