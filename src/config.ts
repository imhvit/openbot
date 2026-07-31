import { configDotenv } from 'dotenv';

configDotenv();

export interface Config {
  token: string;
  clientId: string;
  prefix: string;
  developers: string[];
  guild: string;
  channel: string;
}

if (!process.env.TOKEN) throw new Error('El token no está definido en el archivo .env');
if (!process.env.CLIENT_ID)
  throw new Error('El ID del cliente no está definido en el archivo .env');

export const config: Config = {
  token: process.env.TOKEN,
  clientId: process.env.CLIENT_ID,
  prefix: process.env.PREFIX || '!',
  developers: ['752670048321011722'],
  guild: process.env.GUILD_ID || '1532508968562327743',
  channel: process.env.CHANNEL_ID || '1532509160569176144',
};
