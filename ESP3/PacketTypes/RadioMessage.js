const ESP3Packet = require('../ESP3Packet.js')

class RadioMessage extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'RADIO_MESSAGE'
    this.packetTypeNumber = 9
    this.RORG = this.data[0]
    this.content = this.data.slice(1, this.data.length)
    this.destinationID = this.optionalData.slice(0, 4).toString('hex')
    this.sourceID = this.optionalData.slice(4, 8).toString('hex')
    this.RSSI = this.optionalData[this.optionalData.length - 2]
    this.securityLevel = this.optionalData[this.optionalData.length - 1]
  }
}

module.exports = RadioMessage
