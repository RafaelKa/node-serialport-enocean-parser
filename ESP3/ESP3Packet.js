const emptyPacket = require('./EMPTY_PACKET_STRUCTURE.js')
const getCrc8 = require('./crc8.js')

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
  get packetTypeNumber () {
    return this.header.packetType
  }
  set packetTypeNumber (n) {
    this.header.packetType = n
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
  _rebuild () {
    this.header.dataLength = this.data.length
    this.header.optionalLength = this.optionalData.length
    this.header.packetType = this.packetTypeNumber || this.header.packetType || 0x80
    var dataLengthBuffer = Buffer.alloc(2)
    dataLengthBuffer.writeInt16BE(this.header.dataLength)
    var tmpHeaderBuffer = Buffer.concat([
      dataLengthBuffer,
      Buffer.from([this.header.optionalLength]),
      Buffer.from([this.header.packetType])
    ])
    this.crc8Header = getCrc8(tmpHeaderBuffer)
    var tmpDataBuffer = Buffer.concat([
      this.data,
      this.optionalData
    ])
    this.crc8Data = getCrc8(tmpDataBuffer)
  }
  load (packet) {
    if (!packet) packet = {}
    if (!packet.header) packet.header = {}
    this.packetTypeNumber = packet.packetTypeNumber || packet.header.packetType || this.header.packetType || 0x80
    this.data = packet.data || this.data
    this.optionalData = packet.optionalData || this.optionalData
    this._rebuild()
  }
  send (port, parser) {
    return new Promise((resolve, reject) => {
      var cb = data => {
        if (data.header.packetType === 2) {
          resolve(data)
          parser.removeListener('data', cb)
        }
      }
      parser.on('data', cb)
      console.log(this.getRawBuffer().toString('hex'))
      port.write(this.getRawBuffer())
    })
  }
}

module.exports = ESP3Packet
