const ResponseHandler = require('./ResponseHandler')

class CalloutResponseHandler extends ResponseHandler {
  constructor ({ xray }) {
    super({ xray })
  }

  async test (form, check, response) {
    const result = await this.xray(response, check.selector)

    if (result) {
      return {
        inputName: check.input,
        inputValue: form.data[check.input],
        error: this.sanitize(result)
      }
    } else {
      return false
    }
  }

  /**
   * Strips error / warning prefix and returns first line of the callout message
   *
   * @param {string} calloutText raw .text()
   */
  sanitize (calloutText) {
    return calloutText.trim()
      .replace(/^(\w+)!/, '')
      .split('\n', 1)[0]
      .trim()
  }
}

module.exports = CalloutResponseHandler
