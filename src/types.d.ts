import type { Client } from 'discord.js';

declare module 'shardclient' {
  export class ShardClient extends Client {
    constructor(options: ClientOptions);
  }
  export class ClientOptions {}
  export class CommandBuilder {}
}
