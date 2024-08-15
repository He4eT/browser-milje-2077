const browser = (globalThis.browser ?? globalThis.chrome)

/* */

start()

/* */

function start () {
  Promise.resolve()
    .then(getParamsFromStorage)
    .catch((e) => {
      console.error(e)
      console.log('An error occurred. Milje will use the default params.')
      return {}
    })
    .then(assureParams)
    .then(run)
    .then(setMessageListener)
}

/* Params @see scripts/params.js */

function getParamsFromStorage () {
  return browser.storage.local.get(['params'])
    .then(({params}) => params)
}

function assureParams(params) {
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

/* */

function run({
  randomSeed,
  halfPatternSize,
  scaleFactor,
  gridSize,
  density,
  red,
  green,
  blue,
}) {
  const pattern = generatePattern(
    halfPatternSize,
    gridSize,
    randomSeed || new Date(),
  )
  const miljeCanvas = matrixToCanvas(
    pattern,
    halfPatternSize,
    scaleFactor,
  )

  document.body.appendChild(miljeCanvas)
  return miljeCanvas
}

/* */

function setMessageListener (miljeCanvas) {
  if (!('runtime' in browser)) {
    console.log('Milje 2077 extension cannot set up listener.')
    return
  }

  browser.runtime.onMessage.addListener((message) => {
    switch (message.command) {
      case 'toggleMilje':
        miljeCanvas.hidden = !miljeCanvas.hidden
        break
      default:
        console.log('Milje 2077 extension recieved unsupported message.')
    }
  })
}

/* Parts */

/**
 * LCG using GCC's constants
 * https://en.wikipedia.org/wiki/Linear_congruential_generator
 */
const LCG = (seed) => {
  let state = seed
  const m = 0x80000000 // 2**31
  const a = 1103515245
  const c = 12345

  return () => {
    state = (a * state + c) % m
    return state / (m - 1)
  }
}

/* Pattern generation */

function generatePattern(halfPatternSize, gridSize, randomSeed) {
  const random = LCG(randomSeed)
  const matrix = Array(halfPatternSize * 2).fill(null)
    .map(() => Array(halfPatternSize * 2).fill(0))

  const put = (x, y, value) => {
    const last = halfPatternSize * 2 - 1
    matrix[x][y] = value
    matrix[y][x] = value

    matrix[x][last - y] = value
    matrix[last - y][x] = value

    matrix[last - x][y] = value
    matrix[y][last - x] = value

    matrix[last - y][last - x] = value
    matrix[last - x][last - y] = value
  }

  for (let i = 0; i < halfPatternSize; i++) {
    for (let j = 0; j < halfPatternSize; j++) {
      if ((i % gridSize === 0) || (j % gridSize === 0)) {
        put(i, j, 1)
      } else {
        put(i, j, Number(random() > 0.5))
      }
    }
  }

  return matrix
}

/* Canvas */

function getCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size

  Object.entries({
    'position': 'fixed',
    'top': '0%',
    'left': '50%',
    'transform': 'translateY(-50%) translateX(-50%) rotate(45deg)',
    'filter': 'drop-shadow(0px 0px 10px rgba(60,60,60,0.5))',
    'pointerEvents': 'none',
    'zIndex': '9999',
  }).forEach(([key, value]) => { canvas.style[key] = value })

  return canvas
}

/** @see https://stackoverflow.com/questions/3448347/how-to-scale-an-imagedata-in-html-canvas */
function scaleImageData(imageData, scale, ctx) {
  const scaled = ctx.createImageData(imageData.width * scale, imageData.height * scale)
  const subLine = ctx.createImageData(scale, 1).data
  for (let row = 0; row < imageData.height; row++) {
    for (let col = 0; col < imageData.width; col++) {
      const sourcePixel = imageData.data.subarray(
        (row * imageData.width + col) * 4,
        (row * imageData.width + col) * 4 + 4)
      for (let x = 0; x < scale; x++) {
        subLine.set(sourcePixel, x * 4)
      }
      for (let y = 0; y < scale; y++) {
        const destRow = row * scale + y
        const destCol = col * scale
        scaled.data.set(subLine, (destRow * scaled.width + destCol) * 4)
      }
    }
  }

  return scaled
}

function matrixToCanvas(matrix, halfPatternSize, scaleFactor) {
  const flatMatrix = matrix.flat()
  const canvasSize = halfPatternSize * 2

  const canvas = getCanvas(canvasSize * scaleFactor)
  const ctx = canvas.getContext('2d')

  const imageData = ctx.createImageData(canvasSize, canvasSize)
  for (let i = 0; i < flatMatrix.length; i++) {
    const value = flatMatrix[i] * 255
    const index = i * 4
    imageData.data[index + 0] = value // Red
    imageData.data[index + 1] = value // Green
    imageData.data[index + 2] = value // Blue
    imageData.data[index + 3] = value ? 255 : 0 // Alpha
  }

  const scaledImageData = scaleImageData(imageData, scaleFactor, ctx)
  ctx.putImageData(scaledImageData, 0, 0)

  return canvas
}
