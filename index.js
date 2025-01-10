const { ShardClient, ClientOptions } = require('shardclient');
const client = new ShardClient(
  new ClientOptions()
    .setGuildCommandsId('1322709752756572190')
    .setDevelopers('439601142528344065')
);
client.login();
