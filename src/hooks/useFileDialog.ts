import { useCallback } from 'react';
import { electronFileDialogRpc } from '../rpc/fileDialogRpc.ts';
import { FileDialogOptions } from '../types/default';

export const useFileDialog = (options: FileDialogOptions) => {
  const openFileDialog = useCallback(async () => {
    return await electronFileDialogRpc.showOpenDialog(options);
  }, [options]);

  return openFileDialog;
};
