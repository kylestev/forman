const config = require('config').get('TwoCaptcha')
const TwoCaptchaClient = require('@infosimples/node_two_captcha')
const Captcha = require('@infosimples/node_two_captcha/src/captcha')

class CaptchaSolver {
  /**
   * @param {TwoCaptchaClient} client 
   */
  constructor (client) {
    this.client = client
  }

  /**
   * Create a new CaptchaSolver instance
   */
  static create () {
    const client = new TwoCaptchaClient(config.apiKey, {
      timeout: config.timeout || 120e3,
      polling: config.polling || 5e3,
      throwErrors: true
    })
    return new CaptchaSolver(client)
  }

  /**
   * Solves a reCAPTCHA for a given page.
   *
   * @param {string} siteKey Google reCAPTCHA site key
   * @param {string} pageUrl Page URL to submit captcha for
   * @returns {Promise<Captcha>}
   */
  async solve (siteKey, pageUrl) {
    return this.client.decodeRecaptchaV2({
      googlekey: siteKey,
      pageurl: pageUrl
    })
  }
}

module.exports = CaptchaSolver
