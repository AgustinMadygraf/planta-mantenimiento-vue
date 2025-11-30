// src/utils/devLogger.ts
const mode =
  (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.MODE) ||
  (typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined)

const isDev = mode === 'development'

export function devLog(...args: any[]) {
  if (isDev) {
    console.log(...args)
  }
}
export function devWarn(...args: any[]) {
  if (isDev) {
    console.warn(...args)
  }
}
export function devError(...args: any[]) {
  if (isDev) {
    console.error(...args)
  }
}
