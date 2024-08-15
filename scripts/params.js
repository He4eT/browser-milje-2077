import { browser } from './browser.js'

export const fields = [
  'randomSeed',
  'halfPatternSize',
  'scaleFactor',
  'gridSize',
  'density',
  'red',
  'green',
  'blue',
]

export function getParamsFromStorage () {
  return browser.storage.local.get(['params'])
    .then(({params}) => params)
}

export function setParamsToStorage (params) {
  return browser.storage.local.set({params})
}

export function assureParams(params) {
  const assureNumber = (rawValue) => (defaultValue) => (min, max) => {
    let value = Number(rawValue)

    if (isNaN(value)) return defaultValue
    value = Math.max(min, value)
    value = Math.min(max, value)

    return value
  }

  return {
    randomSeed: assureNumber(params.randomSeed)(0)(0, Infinity),
    halfPatternSize: assureNumber(params.halfPatternSize)(16)(0, Infinity),
    scaleFactor: assureNumber(params.scaleFactor)(16)(0, Infinity),
    gridSize: assureNumber(params.gridSize)(3)(0, Infinity),
    density: assureNumber(params.density)(0.5)(0, 1),
    red: assureNumber(params.red)(255)(0, 255),
    green: assureNumber(params.green)(255)(0, 255),
    blue: assureNumber(params.blue)(255)(0, 255),
  }
}
