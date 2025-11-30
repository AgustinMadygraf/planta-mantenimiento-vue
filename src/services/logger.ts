/*
Path: src/services/logger.ts
*/

declare const process: any;
const envMode =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.MODE) ||
  (typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined)

const isDev =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.DEV) ||
  envMode === 'development'

function noop() {
  // Intentionally empty
}

export const logger = {
  log: isDev ? console.log : noop,
  info: isDev ? console.info : noop,
  warn: isDev ? console.warn : noop,
  error: isDev ? console.error : noop,
}

export default logger
