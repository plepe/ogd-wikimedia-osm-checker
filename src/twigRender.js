const twig = require('twig').twig

const templates = {}

module.exports = function twigRender (template, data) {
  if (!(template in templates)) {
    try {
      templates[template] = twig({ data: template })
    } catch (error) {
      console.error('Error compiling twig template', template, error)
    }
  }

  let result
  try {
    result = templates[template].render(data)
  } catch (error) {
    console.error('Error rendering twig template', template, error)
  }

  return result
}
