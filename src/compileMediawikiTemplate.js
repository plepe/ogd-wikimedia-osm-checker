const compileMediawikiTemplateParameter = require('./compileMediawikiTemplateParameter')

module.exports = function compileMediawikiTemplate (template, data) {
  let result = '{{' + template.name

  const parameter = compileMediawikiTemplateParameter(template.parameter, data)

  result += parameter.map(param => '|' + (('' + param.name).match(/^\d+$/) ? '' : param.name + '=') + (param.value || '')).join('')
  result += '}}'

  return result
}
