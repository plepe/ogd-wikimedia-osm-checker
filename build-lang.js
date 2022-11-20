const fs = require('fs')
const async = require('async')

const languages = ['en', 'de']
const paths = [
  'lang',
  'node_modules/modulekit-lang/lang',
]

async.each(languages,
  (lang, done) => {
    let langStr = {}

    async.each(paths,
      (path, done) => {
        fs.readFile(path + '/' + lang + '.json',
          (err, content) => {
            if (err) { return done(err) }
            const l = JSON.parse(content)
            langStr = {...langStr, ...l}
            done(null)
          }
        )
      },
      (err) => {
        if (err) { return done(err) }
        fs.writeFile('dist/lang_' + lang + '.json', JSON.stringify(langStr), done)
      }
    )
  },
  (err) => {
    if (err) {
      console.error(err)
    }
  }
)
