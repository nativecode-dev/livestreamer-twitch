const debug = require('debug')('nativecode:livestreamer-watch')
const defaults = require('./conf/defaults')
const fs = require('fs')
const locations = require('common-locations')('livestreamer')
const merge = require('merge').recursive
const process = require('process')
const twitch = require('twitch.tv')

const TwitchStreamer = require('livestreamer').TwitchStreamer
const configpath = locations.config.local('livestreamer.json')

let running = {}
let ignored = []

process.on('uncaughtException', error => {
  console.error(error)
})

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
      }).catch((e) => {
        debug('error while streaming -> %s', channel)
        delete running[channel]
        console.error('errored: %s ->', channel, e)
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
  try {
    debug('checking for live streams')
    if (fs.existsSync(configpath)) {
      const config = merge(true, defaults, JSON.parse(fs.readFileSync(configpath)))
      debug('config -> %O', config)

      Object.keys(config.twitch.channels).forEach(channel => {
        debug('checking channel -> %s', channel)
        twitch(`streams/${channel}`, config.twitch.api, (error, response) => {
          if (error) {
            debug('response error -> %s', channel)
            return
          }

          if (response.stream && filter(channel, config.twitch, response.stream) === false) {
            available(config, channel)
          }
        })
      })

      setTimeout(scan, config.interval)
    } else {
      console.log('No configuration found at %s.', configpath)
      setTimeout(scan, 5000)
    }
  } catch (e) {
    console.error(e)
  }
}

console.log('starting livestreamer watch')
scan()
