const ESP3Packet = require('../ESP3Packet.js')

class Radio802 extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'RADIO_802_15_4'
    this.packetTypeNumber = 16
    this.RSSI = this.optionalData[0]
  }
}

module.exports = Radio802
