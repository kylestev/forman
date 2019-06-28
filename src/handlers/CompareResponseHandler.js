const ResponseHandler = require('./ResponseHandler')

class CompareResponseHandler extends ResponseHandler {
  constructor ({ xray }) {
    super({ xray })
  }

  async test (form, check, response) {
    const result = await this.xray(response, check.selector)
    return result === check.expected
  }
}

module.exports = CompareResponseHandler
