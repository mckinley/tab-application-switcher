import Coordinator from './lib/content/coordinator.js'
// Import CSS - Vite will bundle it as a string we can inject
import mainCss from '../styles/main.css?inline'

// Initialize the coordinator - it manages all content script components and messaging
new Coordinator(mainCss)
