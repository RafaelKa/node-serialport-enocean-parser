const Packet = require('../Packet.js')

class F6 extends Packet.RadioERP1 {
  constructor (senderid, payload, status) {
    super()
    this.load({
      data: Buffer.from(`f6${payload}${senderId}${status}`, 'hex'), // the same for all 1BS
      optionalData: Buffer.from('03ffffffffff00', 'hex') // the same for all RadioERP1 Telegrams for the send case
    })
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
      serialport.write(buf)
    })
  }
}

class RockerSwitch extends F6 {
  constructor (addr, port, parser) {
    super(addr, 0x0, 0x20)
    this.port = port
  }
  async downA1 () {
    this.payload = 0x10
    await this.send(port, parser)
  }
  async downA0 () {
    this.payload = 0x30
    await this.send(port, parser)
  }
  async release () {
    this.payload = 0x00
    await this.send(port, parser)
  }
  async on () {
    await this.downA1()
    await this.release()
  }
  async off () {
    await this.downA0()
    await this.release()
  }
}

module.exports = RockerSwitch
