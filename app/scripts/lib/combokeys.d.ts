/**
 * Type definitions for combokeys
 * This is a minimal type definition for the combokeys library
 */

declare module 'combokeys' {
  export default class Combokeys {
    constructor(element?: HTMLElement | Document)
    bind(
      keys: string | string[],
      callback: (event: KeyboardEvent, combo: string) => void | boolean,
      action?: string
    ): void
    unbind(keys: string | string[], action?: string): void
    reset(): void
    detach(): void
    stopCallback(event: KeyboardEvent, element: HTMLElement, combo: string): boolean
  }
}

declare module 'combokeys/helpers/characterFromEvent.js' {
  export default function characterFromEvent(event: KeyboardEvent): string
}
