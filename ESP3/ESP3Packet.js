const emptyPacket = require('./EMPTY_PACKET_STRUCTURE.js')

class ESP3Packet {
  constructor (packet = emptyPacket) {
    this.syncByte = 0x55
    this.header = {
      dataLength: packet.header.dataLength,
      optionalLength: packet.header.optionalLength,
      packetType: packet.header.packetType
    }
    this.crc8Header = packet.crc8Header
    this.data = packet.data
    this.optionalData = packet.optionalData
    this.crc8Data = packet.crc8Data
  }
  getRawBuffer () {
    var dataLengthBuffer = Buffer.alloc(2)
    dataLengthBuffer.writeInt16BE(this.header.dataLength)
    return Buffer.concat(
      [
        Buffer.from([this.syncByte]),
        dataLengthBuffer,
        Buffer.from([this.header.optionalLength]),
        Buffer.from([this.header.packetType]),
        Buffer.from([this.crc8Header]),
        this.data,
        this.optionalData,
        Buffer.from([this.crc8Data])
      ],
      7 + this.header.dataLength + this.header.optionalLength
    )
  }
}

module.exports = ESP3Packet
