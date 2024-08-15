import {
  fields,
  assureParams,
  getParamsFromStorage,
  setParamsToStorage,
} from '../../scripts/params.js'

Promise.resolve()
  .then(getParamsFromStorage)
  .then(assureParams)
  .then(fillForm)
  .then(addFormHandler)

function fillForm (params) {
  Object.entries(params).forEach(([key, value]) => {
    const input = document.getElementById(key)
    input.value = value
    input.dispatchEvent(new Event('input'))
  })
}

function addFormHandler () {
  const form = document.getElementById('settingsForm')
  form.onsubmit = (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const entries = [...formData.entries()]
      .filter(([key]) => fields.includes(key))
    const params = Object.fromEntries(entries)

    setParamsToStorage(params)
  }
}
