class ResponseHandler {
  constructor ({ xray }) {
    this.xray = xray
  }

  /**
   * Tests a submitted form response message
   *
   * @param {Form} form form under test
   * @param {string} response html response
   */
  async test (form, response) {
    throw new Error('Not implemented')
  }
}

module.exports = ResponseHandler
