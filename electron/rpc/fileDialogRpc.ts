import { BrowserWindow, dialog } from 'electron';
import { createElectronSideBirpc } from '../utils/createElectronSideBirpc.ts';
import type { RenderedFunctions } from '../../src/rpc/fileDialogRpc.ts';
import path from 'node:path';
import fs from 'node:fs/promises';
import { FileDialogOptions } from '../../src/types/default';
const modelDirectoryPath = path.join(process.cwd(), 'models');

async function pathExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

export class ElectronFileDialogRpc {
  public readonly rendererFileDialogRpc: ReturnType<
    typeof createElectronSideBirpc<RenderedFunctions, typeof this.functions>
  >;

  public readonly functions = {
    async showOpenDialog(options: FileDialogOptions) {
      const res = await dialog.showOpenDialog({
        message: options.message,
        title: options.title,
        filters: options.filters,
        buttonLabel: options.buttonLabel,
        defaultPath: (await pathExists(modelDirectoryPath)) ? modelDirectoryPath : undefined,
        properties: ['openFile'],
      });

      if (!res.canceled && res.filePaths.length > 0) {
        return options.multiple ? res.filePaths : res.filePaths[0];
      }
      return null;
    },
  } as const;

  public constructor(window: BrowserWindow) {
    this.rendererFileDialogRpc = createElectronSideBirpc<RenderedFunctions, typeof this.functions>(
      'fileDialogRpc',
      'fileDialogRpc',
      window,
      this.functions
    );
  }
}

export type ElectronFunctions = typeof ElectronFileDialogRpc.prototype.functions;

export function registerFileDialogRpc(window: BrowserWindow) {
  new ElectronFileDialogRpc(window);
}
