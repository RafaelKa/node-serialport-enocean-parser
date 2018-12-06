const ESP3Packet = require('../ESP3Packet.js')

class RadioERP2 extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'RADIO_ERP2'
    this.packetTypeNumber = 10
    this.subTelNum = this.optionalData[0]
    this.RSSI = this.optionalData[1]
    this.securityLevel = this.optionalData[2]
  }
}

module.exports = RadioERP2
