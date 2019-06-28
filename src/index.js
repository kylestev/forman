const Form = require('./Form')
const handlers = require('./handlers')
const FormConfig = require('./FormConfig')
const { createForm, loadFormConfig } = require('./FormLoader')

const { matchScript } = require('./queries')

const xray = require('x-ray')({
  filters: {
    esQuery: function (value, name) {
      return matchScript(value, name)
    },
    trim: function (value) {
      if (typeof value === 'string') {
        return value.trim()
      } else {
        return value
      }
    }
  }
})

module.exports = {
  Form,
  FormConfig,
  loadFormConfig,
  buildForm: async function (path, client) {
    return await createForm(
      client,
      xray,
      handlers,
      await loadFormConfig(path)
    )
  }
}
