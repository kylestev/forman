const { buildForm } = require('../index')
const { axiosProxy } = require('../http')

const yargs = require('yargs')
  .command('login', 'Log into the website', yargs => {
    yargs.options({
      username: {
        alias: 'u',
        describe: 'Username credential',
        demand: true
      },
      password: {
        alias: 'p',
        describe: 'Password credential',
        demand: true
      },
      proxy: {
        alias: 'P',
        describe: 'Socks proxy URI',
        demand: false,
        default: ''
      }
    })
  }, async ({ username, password, proxy }) => {
    const axios = axiosProxy(proxy, { maxRedirects: 10 })
    const form = await buildForm('runescape/Login.yml', axios)
    form.set('username', username)
    form.set('password', password)
    const html = await form.submit(axios)
    const extracted = await form.extract(html)
    console.log(JSON.stringify({
      data: form.data, extracted
    }))
  })
  .command('test', '', yargs => {
    yargs.option('proxy')
  }, async ({ proxy }) => {
    const agent = new require('socks-proxy-agent')(proxy)
    const axios = require('axios').default.create({
      httpAgent: agent,
      httpsAgent: agent
    })

    console.log(await axios.get('http://ip-api.com/json').then(({ data }) => data))
  })
  .command('form [config]', 'Test a form', yargs => {
    yargs.positional('config', {
      describe: 'form config [yaml]',
      required: true
    }).option('proxy', {
      describe: 'yolo',
      alias: 'P'
    })
  }, async argv => {
    const axios = axiosProxy(argv.proxy)
    console.log('!!')
    const form = await buildForm(argv.config, axios)
    console.log(form)
    const html = await form.submit(axios)
    console.log(await form.handle(html))
  }).argv;
