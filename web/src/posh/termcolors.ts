export const resetColor = '\x1B[0m';
export const greenText = '\x1B[1;3;32m';
export const redText = '\x1B[1;3;31m';

export function decorateCommand(s: string) {
  return `${greenText}${s}${resetColor}`;
}

export function decorateSay(s: string) {
  return `${greenText}${s}${resetColor}`;
}
