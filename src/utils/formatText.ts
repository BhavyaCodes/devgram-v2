export const formatText = (text: string | undefined): string => {
  if (text === undefined) {
    return '';
  }
  return text.trim().replace(/\n+/g, '\n');
};
