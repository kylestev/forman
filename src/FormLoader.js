const fs = require('fs')
const yaml = require('js-yaml')
const omitBy = require('lodash/omitBy')
const { promisify } = require('util')
const mapValues = require('lodash/mapValues')

const Form = require('./Form')
const FormConfig = require('./FormConfig')
const { parseForm } = require('./FormParser')

const readFile = promisify(fs.readFile)

async function createForm (client, xray, handlerTypes, config, url = '') {
  const initialUrl = url || config.request.url
  const { data: html } = await client.get(initialUrl)

  const { action, inputs, recaptcha } = await parseForm(xray, initialUrl, html, config.selector)

  const form = new Form({
    xray,
    config,
    action,
    recaptcha,
    url: initialUrl,
    handlers: mapValues(handlerTypes, handler => new handler({ xray }))
  })

  form.fill(config.inputs)
  form.fill(omitBy(inputs, x => typeof x.value === 'undefined'))

  return form
}

/**
 * Loads a form configuration file wrapped into a FormConfig object.
 *
 * @param {string} formPath path to form
 * @returns {Promise<FormConfig>}
 */
async function loadFormConfig (formPath) {
  return new FormConfig(yaml.safeLoad(await readFile(formPath, 'utf8')))
}

module.exports = {
  createForm,
  loadFormConfig
}
