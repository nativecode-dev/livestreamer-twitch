const debug = require('debug')('nativecode:livestreamer-twitch')
const fs = require('fs')
const locations = require('common-locations')('livestreamer')
const twitch = require('twitch.tv')

const TwitchStreamer = require('livestreamer').TwitchStreamer
const configpath = locations.config.local('livestreamer.json')

let running = {}
let ignored = []

const available = (config, channel) => {
  const options = config.twitch.channels[channel]
  if (options.enabled && running[channel] === undefined) {
    debug('streaming -> %s', channel)

    console.log('streaming: %s', channel)

    running[channel] = new TwitchStreamer(channel, config.livestreamer)
      .start(options.quality)
      .then(() => {
        debug('completed streaming -> %s', channel)
        delete running[channel]
        console.log('completed: %s', channel)
      }).catch(() => {
        debug('error while streaming -> %s', channel)
        delete running[channel]
        console.log('errored: %s', channel)
      })

  } else {
    debug('channel already running -> %s', channel)
  }
}

const filter = (channel, config, stream) => {
  return config.ignore.keywords.some(keyword => {
    if (stream.channel.status.toLowerCase().includes(keyword.toLowerCase())) {
      debug('[%s] ignoring keyword -> %s', channel, keyword)
      return true
    }

    debug('[%s] keyword not found -> %s', channel, keyword)
    return false
  })
}

const scan = () => {
  debug('checking for live streams')
  if (fs.existsSync(configpath)) {
    const config = require(configpath)
    Object.keys(config.twitch.channels).forEach(channel => {
      debug('checking channel -> %s', channel)
      if (ignored.includes(channel) === false) {
        twitch(`streams/${channel}`, config.twitch.api, (error, response) => {
          if (error) {
            ignored.push(channel)
            debug('error -> %s', channel)
            return
          }

          if (response.stream && filter(channel, config.twitch, response.stream) === false) {
            available(config, channel)
          }
        })
      }
    })
  } else {
    console.log('No configuration found at %s.', configpath)
  }

  debug('checking again in 30 seconds')
  setTimeout(scan, 30000)
}

console.log('starting livestreamer watch')
scan()
