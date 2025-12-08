declare module 'shardclient' {
  import type { Client, Events as NativeEvents } from 'discord.js';

  export class ShardClient extends Client {
    constructor(options: ClientOptions);
  }

  export class ClientOptions {
    constructor();
    setGuildCommandsId(guildCommandsId: string);
    setIntents(intents: GatewayIntentBits[]);
    setDevelopers(developers: string);
  }

  export class CommandBuilder {}
  export class EventBuilder {}
  export const Events = {
    ...NativeEvents,
    ComponentEvent: 'componentEvent',
    CommandEvent: 'commandEvent',
    ModalEvent: 'modalEvent',
  };
}
