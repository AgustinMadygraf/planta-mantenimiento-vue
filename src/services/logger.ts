const isDev = import.meta.env?.DEV ?? import.meta.env?.MODE === 'development'

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
