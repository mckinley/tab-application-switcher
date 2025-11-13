import Tabs from './tabs.js'
import Connection from './connection.js'
import type { IBackgroundCoordinator } from '../types.js'

export default class BackgroundCoordinator implements IBackgroundCoordinator {
  tabs: Tabs
  connection: Connection

  constructor() {
    this.tabs = new Tabs(this)
    this.connection = new Connection()
  }
}
