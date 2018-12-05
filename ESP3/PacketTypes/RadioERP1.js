const ESP3Packet = require('../ESP3Packet.js')

class RadioERP1 extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'RADIO_ERP1'
    this.header.packetType = 1
    this.RORG = this.data[0]
    // this.senderId = this.data.slice(this.data.length - 5, this.data.length - 1).toString('hex')
    this.status = this.data[this.data.length - 1]
    this.subTelNum = this.optionalData[0]
    this.destinationID = this.optionalData.slice(1, 5).toString('hex')
    this.RSSI = this.optionalData[5]
    this.securityLevel = this.optionalData[6]
  }
  get packetTypeNumber () {
    return this.header.packetType
  }
  set packetTypeNumber (x) {
    this.header.packetType = 1
  }
  get senderId () {
    return this.data.slice(this.data.length - 5, this.data.length - 1).toString('hex')
  }
  set senderId (id) {
    var idb = Buffer.from(id, 'hex')
    for (var i = 0; i < 4; i++) {
      this.data[this.data.length - 5 + i] = idb[i]
    }
    this._rebuild()
  }
}

module.exports = RadioERP1
