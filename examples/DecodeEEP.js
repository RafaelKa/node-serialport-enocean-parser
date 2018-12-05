const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser')
const transcoder = require('eep-transcoder')

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const tcm310 = port.pipe(new EnoceanParser())

/* eslint-disable no-console  */
tcm310.on('data', function (esp3Packet) {
  ESP3PacketFrom4BSSensor(esp3Packet)
}).on('error', console.error)

function ESP3PacketFrom4BSSensor (esp3Packet) {
  var sensors = {
    'ffd9b7e5': {
      eep: 'a5-10-06',
      name: 'Thermostat Büro'
    },
    '002a1d7e': {
      eep: 'f6-02-03',
      name: 'Switch'
    }
  }

  if (sensors.hasOwnProperty(esp3Packet.senderId)) {
    var eep = sensors[esp3Packet.senderId].eep
    var packetString = esp3Packet.getRawBuffer().toString('hex')
    console.log(`Sensor ${esp3Packet.senderId} is of type ${eep}. decoding data...`)
    console.log(transcoder.decode(packetString, eep).decoded)
    // Info on all fields content and how to make sense of the data can be found at https://node-enocean.github.io/eep-spec/
  } else {
    console.log(`no eep info found for ${esp3Packet.senderId}`)
    // console.log(transcoder.decode(packetString,"a5-10-06"))
  }
}
