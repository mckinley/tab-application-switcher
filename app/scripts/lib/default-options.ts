export interface KeyConfig {
  modifier: string
  next: string
  previous: string
}

export interface DefaultOptions {
  keys: {
    mac: KeyConfig
    windows: KeyConfig
  }
}

const defaultOptions: DefaultOptions = {
  keys: {
    mac: {
      modifier: 'alt',
      next: 'tab',
      previous: '`'
    },
    windows: {
      modifier: 'meta',
      next: 'tab',
      previous: '`'
    }
  }
}

export default defaultOptions
