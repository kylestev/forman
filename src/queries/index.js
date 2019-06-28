const esprima = require('esprima')
const esquery = require('esquery')

const get = require('lodash/get')
const mapValues = require('lodash/mapValues')

const queries = {
  gtmUser: {
    test: `
        var gtmSite = 'dual';

            var gtmUser = {
                id: 53527441,
                name: 'NerdB0i',
                member: false,
                language: 0,
                isLoggedIn: 1
            };`,
    scope: ':declaration [id.name="gtmUser"] Property',
    selector: [{
      key: 'key.name',
      value: 'value.value'
    }],
    transform (results) {
      return results.reduce((obj, v) => ({ ...obj, [v.key]: v.value }), {})
    }
  },
  nameCheckUrl: {
    test: `
        var ajaxNameCheckUrl='https://secure.runescape.com/m=displaynames/c=a99UOVm0z91/check_name?displayname=',
            currentName='testname1',
            gaEvents = ['ERROR: DEFAULT - Character name change form'];`,
    scope: 'VariableDeclarator[id.name=ajaxNameCheckUrl]',
    selector: 'init.value'
  },
  currentName: {
    test: `
        var ajaxNameCheckUrl='https://secure.runescape.com/m=displaynames/c=a99UOVm0z91/check_name?displayname=',
            currentName='testname1',
            gaEvents = ['ERROR: DEFAULT - Character name change form'];`,
    scope: 'VariableDeclarator[id.name=currentName]',
    selector: 'init.value'
  },
  recaptchaSiteKey: {
    test: `
        var onSubmit = function() {
                $('#confirm-name-form').submit();
        };

        var onloadCallback = function() {
            grecaptcha.render('name-submit', {
                'sitekey' : '6Lcsv3oUAAAAAGFhlKrkRb029OHio098bbeyi_Hv',
                'callback' : onSubmit
            });
        };`,
    scope: ':expression :matches([callee.object.name="grecaptcha"]) ObjectExpression :matches([key.value="sitekey"]) > Literal.value',
    selector: 'value'
  }
}

function applyQuery (match, query) {
  // query = 'key.name'
  if (typeof query === 'string') {
    return get(match, query)
  }
  // query = { ... }
  if (typeof query === 'object') {
    return mapValues(query, $selector => applyQuery(match, $selector))
  }
}

function match (ast, { scope, selector }) {
  const matches = esquery.query(ast, scope)
  if (selector instanceof Array) {
    const $query = selector[0]
    return matches.map(m => applyQuery(m, $query))
  }

  return applyQuery(matches[0], selector)
}

module.exports = {
  queries,
  matchScript: function (script, name) {
    const $ray = queries[name]
    const ast = esprima.parseScript(script)

    const results = match(ast, $ray)
    if ($ray.transform) {
      return $ray.transform(results)
    } else {
      return results
    }
  }
}
