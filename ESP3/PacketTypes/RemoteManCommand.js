const ESP3Packet = require('../ESP3Packet.js')

class RemoteManCommand extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
    this.packetTypeName = 'REMOTE_MAN_COMMAND'
    this.packetTypeNumber = 7
    this.function = parseInt(this.data.slice(0, 2).toString('hex'), 16)
    this.manufacturerID = parseInt(this.data.slice(2, 4).toString('hex'), 16)
    this.msg = this.data.slice(4, this.data.length)
    this.destinationID = this.optionalData.slice(0, 4).toString('hex')
    this.sourceID = this.optionalData.slice(4, 8).toString('hex')
    this.RSSI = this.optionalData[this.optionalData.length - 2]
    this.sendWithDelay = this.optionalData[this.optionalData.length - 1]
  }
}

module.exports = RemoteManCommand
