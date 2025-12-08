declare module 'shardclient' {
  import type { Client } from 'discord.js';

  export class ShardClient extends Client {
    constructor(options: ClientOptions);
  }
  export class ClientOptions {}
  export class CommandBuilder {}
}
