const ESP3Packet = require('../ESP3Packet.js')

class RadioSubTel extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'RADIO_ERP1'
    this.packetTypeNumber = 1
    this.RORG = this.data[0]
    this.senderId = this.data.slice(this.data.length - 5, this.data.length - 1).toString('hex')
    this.status = this.data[this.data.length - 1]
    this.subTelNum = this.optionalData[0]
    this.destinationID = this.optionalData.slice(1, 5).toString('hex')
    this.RSSI = this.optionalData[5]
    this.securityLevel = this.optionalData[6]
    this.timeStamp = this.optionalData.slice(7, 9).toString('hex')
    this.subTelGroups = []
    var offset = 9
    for (var i = 0; i < this.subTelNum; i++) {
      var subTel = {
        tick: this.optionalData[offset + (i * 3)],
        RSSI: this.optionalData[offset + (i * 3) + 1],
        status: this.optionalData[offset + (i * 3) + 2]
      }
      this.subTelGroups.push(subTel)
    }
  }
}

module.exports = RadioSubTel
