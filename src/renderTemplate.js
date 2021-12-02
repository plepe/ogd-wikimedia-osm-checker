const twig = require('twig').twig

const twigTemplates = {}

module.exports = function renderTemplate (template, data) {
  template = template.replace(/\n/g, '\n\n')
  if (!(template in twigTemplates)) {
    twigTemplates[template] = twig({ data: template })
  }

  return twigTemplates[template]
    .render(data)
    .split(/\n/g)
    .filter(f => f)
}
