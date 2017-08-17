const fs = require('fs')
const Handlebars = require('handlebars')
const execa = require('execa')
const path = require('path')

var data = {
  music_directory: process.env['MUSIC_DIR'],
  username: process.env['MPD_USER']
}

if (data.music_directory !== undefined && data.username !== undefined) {
  fs.readFile('conf', 'utf-8', (err, src) => {
    var template = Handlebars.compile(src)
    var output = template(data)
    execa.shell('echo $OUTPUT | sudo tee /etc/mpd/mpd.conf', {
      env: {
        OUTPUT: output
      }
    })
    .then(data => {
      console.log('success...')
    })
    .catch(err => {
      console.error(err)
    })
  })  
} else {
  console.error('directory or username is undefined...')
}