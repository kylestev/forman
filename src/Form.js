const each = require('lodash/each')
const find = require('lodash/find')
const FormData = require('form-data')
const map = require('lodash/map')
const fromPairs = require('lodash/fromPairs')
const { FormConfig } = require('./index')
const captchaApi = require('./CaptchaSolver').create()

class Form {
  /**
   * @param {FormConfig} config form config
   */
  constructor ({ config, xray, url, action, handlers, recaptcha }) {
    this.url = url
    this.xray = xray
    this.config = config
    this.action = action
    this.handlers = handlers
    this.recaptcha = recaptcha
    this.data = fromPairs(map(config.inputs, input => [input.name, input.default]))
  }

  get inputs () {
    return this.config.inputs
  }

  fill (inputs) {
    each(inputs, ({ name, value }) => {
      this.set(name, value)
    })
  }

  set (name, value) {
    const input = this.inputs[name] || find(this.inputs, { name })
    if (!input) {
      throw new Error(`No key "${name}" in defined inputs`)
    }

    this.data[input.name] = value
  }

  getHandler (type) {
    if (!(type in this.handlers)) {
      throw new Error(`No handler for type: ${type}`)
    }
    return this.handlers[type]
  }

  async handle (html) {
    for (const check of this.config.checks) {
      const checker = this.getHandler(check.type)
      const result = await checker.test(this, check, html)
      if (result) {
        return { success: check.success, check, result }
      }
    }

    throw new Error('Unhandled!')
  }

  async submit (client) {
    const captcha = find(this.inputs, { type: 'recaptcha' })
    if (captcha) {
      if (this.recaptcha) {
        const { text: token } = await captchaApi.solve(this.recaptcha, this.url)
        this.data[captcha.name] = token
      } else {
        delete this.data[captcha.name]
      }
    }

    const formData = new FormData()
    each(this.data, (value, key) => {
      if (value)
        formData.append(key, value)
    })

    const { data: responseHtml, headers } = await client.post(this.action, formData, {
      headers: {
        Referer: this.config.request.url,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        'Accept-Language': 'en-US,en;q=0.9',
        'DNT': '1',
        ...formData.getHeaders()
      }
    })

    return responseHtml
  }

  async extract (html) {
    const data = {}
    for (const key in this.config.outputs) {
      const b = this.config.outputs[key]
      if (typeof b.selector === 'string') {
        data[key] = await this.xray(html, b.scope, b.selector)
      } else if (b.selectors instanceof Array) {
        data[key] = await this.xray(html, b.scope, b.selectors)
      }
    }
    return data
  }
}

module.exports = Form
