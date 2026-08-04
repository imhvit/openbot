import type { ExtendedClient } from '@/structure/Client';
import { resolve } from 'path';
import fg from 'fast-glob';
import chalk from 'chalk';

export async function loadComponents(client: ExtendedClient) {
  const componentsPath = resolve(__dirname, '..', 'components');

  const componentFiles = await fg('**/*.{ts,js}', {
    cwd: componentsPath,
    absolute: true,
  });

  const totalComponents = componentFiles.length;
  let loadedComponents = 0;

  for (const file of componentFiles) {
    const imported = require(file);
    const component = imported.default || imported;

    if (!component.data?.customId || typeof component.execute !== 'function') {
      console.warn(
        chalk.yellow(`[WARNING] `) +
          chalk.white(`El archivo ${file} no exporta un componente válido. Ignorando.`),
      );
      continue;
    }

    client.components.set(component.data.customId, component);
    loadedComponents++;
  }

  console.log(
    chalk.cyan(`[Components] `) +
      chalk.white(`Componentes cargados: ${loadedComponents}/${totalComponents}`),
  );
}
