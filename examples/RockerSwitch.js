const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser').FullParser

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 57600 })
const tcm310 = port.pipe(new EnoceanParser())

/*
 To use EnOcean Pi module you must disable serial console on /dev/ttyAMA0,
 you can do that with https://github.com/lurch/rpi-serial-console

 And /dev/ttyAMA0 must be readable from your user.
 add your user to dialout group or simple run "sudo chmod 777 /dev/ttyAMA0"

 */

/* eslint-disable no-console  */
tcm310.on('data', function (esp3Packet) {
  console.log(ESP3PacketFromRockerSwitchPTMXXX(esp3Packet))
}).on('error', console.error)

function ESP3PacketFromRockerSwitchPTMXXX (esp3Packet) {
  if (esp3Packet.RORG !== 0xF6) {
    return "I don't understand " + esp3Packet.RORG.toString(16) + ' this telegram, i can show only Rocker Switch telegrams!'
  }

  // see RPS Telegram in "EnOcean Equipment Profiles (EEP)"
  var rockersFirstAction = (esp3Packet.data >>> 5) // 11100000 >> 5              | Shortcut : R1
  var energyBow = ((esp3Packet.data >> 4) & 1) // 00010000                   | Shortcut : EB  -> 0 = released or 1 = pressed
  var rockersSecondAction = ((esp3Packet.data >> 1) & 0x07) // (00001110 >> 1) & 00000111 | Shortcut : R2
  var secondActionIsPresent = ((esp3Packet.data) & 1) // 00000001                   | Shortcut : EB

  // see Statusfield for RPS in "EnOcean Equipment Profiles (EEP)"
  // unused: var T21 = (esp3Packet.status & 0x20) == 0x20              // 00100000                   | 0 = PTM1xx or 1 = PTM2xx
  var NU = (esp3Packet.status & 0x10) === 0x10 // 00010000                   | 0 = unassigned or 1 = normal

  var buttonName = {
    0: 'AI',
    1: 'A0',
    2: 'BI',
    3: 'B0',
    4: 'CI',
    5: 'C0',
    6: 'DI',
    7: 'D0'
  }

  var energyBowDescription = {
    0: 'on up', // released
    1: 'on down' // pressed
  }

  var pushedButtons = ''

  if (NU === 1) {
    pushedButtons += buttonName[rockersFirstAction]
  } else {
    pushedButtons += 'no'
  }
  if (secondActionIsPresent === 1) {
    pushedButtons += ' & ' + buttonName[rockersSecondAction]
  }

  var output = '{' + '\n' +
    '  Sender ID:  ' + esp3Packet.senderID + '\n' +
    '  energy bow: ' + energyBowDescription[energyBow] + '\n' +
    '  button[s]:  ' + pushedButtons + '\n' +
    '}\n'

  return output
}
