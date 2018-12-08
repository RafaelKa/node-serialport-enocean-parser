const Packet = require('../Packet.js')

class F6 extends Packet.RadioERP1 {
  constructor (senderId, payload, status) {
    super()
    this.load({
      data: Buffer.from(`f6${payload}${senderId}${status}`, 'hex'), // the same for all 1BS
      optionalData: Buffer.from('03ffffffffff00', 'hex') // the same for all RadioERP1 Telegrams for the send case
    })
  }
}

class RockerSwitch extends F6 {
  constructor (addr, port, parser) {
    super(addr, '00', '20')
    this.port = port
    this.parser = parser
  }
  async downA1 () {
    this.payload = 0x10
    await this.send(this.port, this.parser)
  }
  async downA0 () {
    this.payload = 0x30
    await this.send(this.port, this.parser)
  }
  async release () {
    this.payload = 0x00
    await this.send(this.port, this.parser)
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
