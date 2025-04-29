import { createBirpc } from 'birpc';

export function createRendererSideBirpc<
  const RendererFunction = Record<string, never>,
  const ElectronFunctions extends object = Record<string, never>,
>(
  toRendererEventName: string,
  fromRendererEventName: string,
  electronFunctions: ElectronFunctions
) {
  return createBirpc<RendererFunction, ElectronFunctions>(electronFunctions, {
    post: data => window.ipcRenderer.send(fromRendererEventName, data),
    on: onData =>
      window.ipcRenderer.on(toRendererEventName, (event, data) => {
        onData(data);
      }),
    serialize: value => JSON.stringify(value),
    deserialize: value => JSON.parse(value),
    timeout: 60000, // Increase timeout to 60 seconds
    onError: (error, method) => {
      console.error(`[birpc] Error in ${method}:`, error);
      return true; // Prevent throwing the error
    },
    onFunctionError: (error, method) => {
      console.error(`[birpc] Function error in ${method}:`, error);
      return true; // Prevent throwing the error
    },
  });
}
