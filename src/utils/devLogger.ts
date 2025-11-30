// src/utils/devLogger.ts
export function devLog(...args: any[]) {
  if (import.meta.env.MODE === 'development') {
    console.log(...args)
  }
}
export function devWarn(...args: any[]) {
  if (import.meta.env.MODE === 'development') {
    console.warn(...args)
  }
}
export function devError(...args: any[]) {
  if (import.meta.env.MODE === 'development') {
    console.error(...args)
  }
}
