import { ElectronFunctions } from '../../electron/rpc/fileDialogRpc.ts';
import { createRendererSideBirpc } from '../utils/createRendererSideBirpc.ts';

const renderedFunctions = {} as const;
export type RenderedFunctions = typeof renderedFunctions;

export const electronFileDialogRpc = createRendererSideBirpc<ElectronFunctions, RenderedFunctions>(
  'fileDialogRpc',
  'fileDialogRpc',
  renderedFunctions
);
