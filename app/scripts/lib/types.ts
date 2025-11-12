/**
 * Shared type definitions for the Tab Application Switcher extension
 */

/**
 * Extended Chrome tab with additional properties
 * We omit certain fields from chrome.tabs.Tab to make them optional in our usage
 */
export interface Tab extends Omit<chrome.tabs.Tab, 'index' | 'windowId' | 'id' | 'active' | 'title' | 'url'> {
  favIconUrl?: string
  title?: string
  url?: string
  id?: number
  windowId?: number
  active?: boolean
  index?: number
}

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

export type RuntimeMessage = PingMessage | ActivateMessage | TabsRequestMessage | SelectTabMessage

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
  handleOmniboxSelectTab(tab: Tab): void
}
