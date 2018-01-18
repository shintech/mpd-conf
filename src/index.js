import fs from 'fs'
import Handlebars from 'handlebars'
import execa from 'execa'
import chalk from 'chalk'
require('babel-polyfill')

const data = {
  music_directory: process.env['MUSIC_DIR'],
  username: process.env['MPD_USER'],
  port: process.env['PORT']
}

const main = async (callback) => {
  if (data.music_directory !== undefined && data.username !== undefined) {
    try {
      console.log(chalk.magentaBright('Creating files...'))
      await createFiles()
      console.log(chalk.cyanBright('Success...'))

      console.log(chalk.magentaBright('Writing mpd.conf...'))
      await writeConf()
      console.log(chalk.cyanBright('Success...'))

      callback()
    } catch (err) {
      console.log(chalk.red(err))
    }
  } else {
    console.log(chalk.red('Directory or Username is undefined...'))
  }
}

const createFiles = function () {
  return new Promise(function (resolve, reject) {
    let mpdDir = `/home/${data.username}/mpd`

    let cmd = `mkdir -p ${mpdDir}/playlists && \
      touch ${mpdDir}/tag_cache ${mpdDir}/mpd.log ${mpdDir}/pid ${mpdDir}/state ${mpdDir}/sticker.sql`

    execa.shell(cmd)
    .then(function () {
      resolve()
    })
    .catch(err => {
      reject(err)
    })
  })
}

const writeConf = function () {
  return new Promise(function (resolve, reject) {
    fs.readFile('conf', 'utf-8', (err, src) => {
      if (err) reject(err)

      let template = Handlebars.compile(src)
      let output = template(data)
      let cmd = 'echo $OUTPUT | sudo tee /etc/mpd.conf'

      execa.shell(cmd, {
        env: {
          OUTPUT: output
        }
      })
      .then(data => {
        resolve()
      })
      .catch(err => {
        reject(err)
      })
    })
  })
}

main(() => {
  console.log(chalk.greenBright('All done...'))
})
