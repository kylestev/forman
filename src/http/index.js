const Axios = require('axios')
const SocksAgent = require('socks-proxy-agent')

function axiosProxy (proxy, config) {
  const agent = !!proxy ? new SocksAgent(proxy) : null
  return Axios.default.create({
    ...config,
    httpAgent: agent,
    httpsAgent: agent
  })
}

module.exports = {
  axiosProxy
}
