function escape (str) {
  if (str === undefined || str === null) {
    return '.*'
  }

  return str.replace(/([/~@#&*()-+{}[\]|<>?.\\])/g, '\\$1')
}

module.exports = function compileMediawikiTemplateSearchRegexp (template) {
  const regexp = '\\{\\{ *' + escape(template.name) + ' *'
  const index = 0

  const p = template.parameter.map(param => {
    let r = ''
    if (Number.isInteger(param.name) || param.name.match(/^[0-9]+$/)) {
      r = '\\| *(' + escape('' + param.name) + ' *=)? *' + escape(param.value) + ' *'
    } else {
      r = '\\| *' + escape('' + param.name) + ' *= *' + escape(param.value) + ' *'
    }

    if (param.optional) {
      r = '(' + r + ')?'
    }

    return r
  })

  const result = 'hastemplate:"' + template.name + '" insource:/' + regexp + p.join('') + '[\\|\\}]/'
  console.log(result)
  return result
}
