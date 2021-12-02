const twig = require('twig').twig

const twigTemplates = {}

module.exports = function compileMediawikiTemplateParameter (parameter, data) {
  parameter = JSON.parse(JSON.stringify(parameter))

  return parameter.map(p => {
    if (p.value && p.value.match(/\{/)) {
      if (!(p.value in twigTemplates)) {
        twigTemplates[p.value] = twig({ data: p.value })
      }

      p.value = twigTemplates[p.value].render(data)
    }

    return p
  })
}
