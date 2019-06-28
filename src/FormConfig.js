const mapValues = require('lodash/mapValues')

class FormInput {
  constructor ({ name, description, type, value }) {
    this.name = name
    this.type = type
    this.value = value
    this.description = description
  }
}

class ResponseCheck {
  constructor ({ name, selector, type, input, expected, success }) {
    this.name = name
    this.success = success
    this.selector = selector
    this.expected = expected
    this.type = type
    this.input = input
  }
}

class FormConfig {
  constructor ({ selector, request, inputs, checks, outputs }) {
    this.selector = selector
    this.request = request
    this.inputs = mapValues(inputs, x => new FormInput(x))
    this.checks = checks.map(x => new ResponseCheck(x))
    this.outputs = outputs || {}
  }
}

module.exports = FormConfig
