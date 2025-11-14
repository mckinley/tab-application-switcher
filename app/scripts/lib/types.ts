/**
 * Shared type definitions for the Tab Application Switcher extension
 */

export type Tab = chrome.tabs.Tab

/**
 * Message types for Chrome runtime messaging
 */
export interface PingMessage {
  ping: true
}

export interface PongResponse {
  pong: true
}

export interface ActivateMessage {
  action: 'activate'
}

export interface TabsRequestMessage {
  tabs: true
}

export interface TabsResponseMessage {
  tabs: Tab[]
}

export interface SelectTabMessage {
  selectTab: {
    id: number
    windowId: number
  }
}

export interface ActivateOverlayMessage {
  activateOverlay: true
}

export interface ActivateOrNextMessage {
  activateOrNext: true
}

export type RuntimeMessage =
  | PingMessage
  | ActivateMessage
  | TabsRequestMessage
  | SelectTabMessage
  | ActivateOverlayMessage
  | ActivateOrNextMessage

export type RuntimeResponse = PongResponse | TabsResponseMessage | void

/**
 * Keyboard key configuration
 */
export interface Keys {
  modifier: string
  next: string[]
  previous: string[]
  activate: string
  select: string[]
  cancel: string[]
}

/**
 * Coordinator interface for dependency injection
 */
export interface ICoordinator {
  // Chrome API methods
  getTabs(): Promise<Tab[]>
  selectTab(tab: Tab): void
  destroy(): void

  // User action handlers
  handleActivate(): void
  handleNext(): void
  handlePrevious(): void
  handleSelect(): void
  handleCancel(): void
  handleDeactivate(): void
  handleSearch(): void
  handleShowOptions(): void
}

/**
 * Background coordinator interface
 */
export interface IBackgroundCoordinator {
  tabs: { tabs: Tab[] }
}
