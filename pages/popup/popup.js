import { browser } from '../../scripts/browser.js'

document.getElementById('toggleMiljeButton').onclick = () => {
  browser.tabs.query({active: true, currentWindow: true})
    .then(([tab]) => browser.tabs.sendMessage(tab.id, {
      command: 'toggleMilje',
    }))
}

document.getElementById('openSettingsButton').onclick = () => {
  browser.storage.local.set({'params': {scaleFactor: 16}})
  console.log('openSettingsButton')
}
