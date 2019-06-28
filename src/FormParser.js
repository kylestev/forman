const { URL } = require('url')

async function parseForm (xray, initialUrl, html, formSelector) {
  const { action, method, inputs, recaptcha } = await xray(html, formSelector, {
    action: '@action',
    method: '@method',
    inputs: xray('input, submit', [{
      name: '@name',
      value: '@value'
    }]),
    recaptcha: 'script:contains(recaptcha) | esQuery:recaptchaSiteKey'
  })

  const actionUrl = new URL(action || '', initialUrl)
  actionUrl.search = ''

  return {
    recaptcha,
    action: actionUrl.toString(),
    method: method || 'POST',
    inputs: inputs.filter(x => !!x.name)
  }
}

module.exports = {
  parseForm
}
