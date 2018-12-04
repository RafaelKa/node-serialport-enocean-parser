/*jslint node: true */
'use strict'

const ESP3_EMPTY_PACKET_STRUCTURE = require('./EMPTY_PACKET_STRUCTURE')

class ESP3Packet {

  constructor(esp3EmptyPacketStructure = ESP3_EMPTY_PACKET_STRUCTURE) {
    this.syncByte = esp3EmptyPacketStructure.syncByte
    this.header = esp3EmptyPacketStructure.header
    this.crc8Header = esp3EmptyPacketStructure.crc8Header
    this.data = esp3EmptyPacketStructure.data
    this.optionalData = esp3EmptyPacketStructure.optionalData
    this.crc8Data = esp3EmptyPacketStructure.crc8Data
  }

  getRawBuffer() {
    let dataLengthBuffer = Buffer.alloc(2)
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
