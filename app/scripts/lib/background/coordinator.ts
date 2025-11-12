import Tabs from './tabs.js'
import Omnibox from './omnibox.js'
import Connection from './connection.js'
import type { Tab, IBackgroundCoordinator } from '../types.js'

export default class BackgroundCoordinator implements IBackgroundCoordinator {
  tabs: Tabs
  omnibox: Omnibox
  connection: Connection

  constructor() {
    // Create all background components with references to coordinator
    this.tabs = new Tabs(this)
    this.omnibox = new Omnibox(this)
    this.connection = new Connection()
  }

  // ============================================
  // CROSS-COMPONENT COMMUNICATION
  // Called by components to interact with each other
  // ============================================

  // Called by Omnibox when user selects a tab from omnibox
  handleOmniboxSelectTab(tab: Tab): void {
    this.tabs.selectTab(tab)
  }
}
