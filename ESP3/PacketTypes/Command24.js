const ESP3Packet = require('../ESP3Packet.js')

class Command24 extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'Command_2_4'
    this.packetTypeNumber = 17
    const commandTypes = [
      { number: 0, name: 'undefined' },
      { number: 1, name: 'SET_CHANNEL' },
      { number: 2, name: 'GET_CHANNEL' }
    ]
    this.commandType = commandTypes[this.data[0]]
    if (this.data[0] === 1) {
      this.channel = this.data[1]
    }
  }
}

module.exports = Command24
