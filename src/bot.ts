import { ExtendedClient } from './structure/Client';

const client = new ExtendedClient();

client.init().catch((error) => {
  console.error('[Worker] Fatal error en init:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
  console.error('[Worker] Unhandled promise rejection:', error);
});
