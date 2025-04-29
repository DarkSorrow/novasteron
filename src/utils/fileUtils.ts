/**
 * Converts a local file path to a format that can be used in Electron
 * @param filePath The local file path to convert
 * @returns A URL that can be used to display the file in Electron
 */
export const getLocalFileUrl = (filePath: string): string => {
  if (!filePath) return '';

  // Check if it's already a URL
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // For local files, use the file:// protocol
  return `file://${filePath.replace(/\\/g, '/')}`;
};

/**
 * Checks if a path is a local file path
 * @param path The path to check
 * @returns boolean indicating if the path is a local file path
 */
export const isLocalFile = (path: string): boolean => {
  if (!path) return false;
  return !path.startsWith('http://') && !path.startsWith('https://');
};
