import Options from '../content/options.js'
import type { Tab } from '../types.js'

export default class OptionsCoordinator {
  options: Options

  constructor() {
    this.options = new Options(this)
    const container = document.querySelector('.TAS_optionsCon')
    if (container) {
      container.appendChild(this.options.render())
    }
  }

  // ============================================
  // STUB METHODS
  // Options page doesn't need most coordinator methods
  // ============================================

  getTabs(): Promise<Tab[]> {
    return Promise.resolve([])
  }

  selectTab(_tab: Tab): void {
    // Not used in options page
  }

  destroy(): void {
    // Not used in options page
  }

  handleActivate(): void {
    // Not used in options page
  }

  handleNext(): void {
    // Not used in options page
  }

  handlePrevious(): void {
    // Not used in options page
  }

  handleSelect(): void {
    // Not used in options page
  }

  handleCancel(): void {
    // Not used in options page
  }

  handleDeactivate(): void {
    // Not used in options page
  }

  handleSearch(): void {
    // Not used in options page
  }

  handleShowOptions(): void {
    // Already showing options
  }
}
