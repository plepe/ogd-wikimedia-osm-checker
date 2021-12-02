const twig = require('twig').twig

const twigTemplates = {}

module.exports = function renderTemplate (template, data) {
  if (Array.isArray(template)) {
    return template
      .map(line => {
        if (!(line in twigTemplates)) {
          twigTemplates[line] = twig({ data: line })
        }

        return twigTemplates[line].render(data)
      })
      .filter(f => f)
  }

  template = template.replace(/\n/g, '\n\n')
  if (!(template in twigTemplates)) {
    twigTemplates[template] = twig({ data: template })
  }

  return twigTemplates[template]
    .render(data)
    .split(/\n/g)
    .filter(f => f)
}
