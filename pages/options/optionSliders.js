function syncSliders(sliderId, numberInputId) {
  const slider = document.getElementById(sliderId)
  const numberInput = document.getElementById(numberInputId)

  slider.addEventListener('input', () => {
    numberInput.value = slider.value
  })

  numberInput.addEventListener('input', () => {
    slider.value = numberInput.value
  })
}

syncSliders('density', 'densityValue')
syncSliders('red', 'redValue')
syncSliders('green', 'greenValue')
syncSliders('blue', 'blueValue')
