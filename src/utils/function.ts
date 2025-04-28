export const parseError = (error: any): string | null => {
  console.error(error);
  if (error instanceof Error) {
    return error.message;
  }
  return null;
}
