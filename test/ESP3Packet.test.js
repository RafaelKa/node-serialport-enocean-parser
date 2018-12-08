/* eslint-disable no-undef  */
const assert = require('chai').assert
// const sinon = require('sinon')
const Packets = require('../Packet')

describe('ESP3 Packets', function () {
  describe('when rebuilding', function () {
    it('types SHOULD be dertermined by the classes packetType even if set otherwise', function () {
      var packet = new Packets.RadioERP1()
      // packet._rebuild()
      assert.equal(packet.header.packetType, 1, '')
      packet.load({ header: { packetType: 3 } })
      assert(packet.header.packetType, 1, '')
      packet.packetTypeNumber = 3
      assert(packet.header.packetType, 1, '')
    })
    it('if no packetTypeNumber is set, it SHOULD be possible to set it manually. (defaults to 0x80)', function () {
      var packet = new Packets.ESP3Packet()
      packet._rebuild()
      assert.equal(packet.header.packetType, 0x80, '')
      packet.load({ header: { packetType: 3 } })
      assert(packet.header.packetType, 3, '')
    })
    it('the dataLength and optionalLength SHOULD be determined from the data and optionalData Buffers', function () {
      var packet = new Packets.ESP3Packet()
      packet.load({
        data: Buffer.from('08', 'hex'),
        optionalData: Buffer.from('0803', 'hex')
      })
      assert.equal(packet.header.dataLength, 1, '')
      assert.equal(packet.header.optionalLength, 2, '')
    })
    it('the CRC8 Checksums SHOULD be recalculated', function () {
      var packet = new Packets.ESP3Packet()
      packet.load({
        header: { packetType: 5 },
        data: Buffer.from('08', 'hex')
      })
      assert.equal(packet.crc8Header, 0x70, '')
      assert.equal(packet.crc8Data, 0x38, '')
    })
    describe('when setting', function () {
      it('RadioERP1s senderId, it SHOULD reflect the change and keep the checksums in sync', function () {
        var packet = new Packets.RadioERP1()
        packet.load({
          packetTypeNumber: 3,
          data: Buffer.from('a5c87f710fffdba5e400', 'hex'),
          optionalData: Buffer.from('01ffffffff4700', 'hex')
        })
        assert.equal(packet.getRawBuffer().toString('hex'), '55000a0701eba5c87f710fffdba5e40001ffffffff47000d', '')
        packet.senderId = 'aabbccdd'
        assert.equal(packet.getRawBuffer().toString('hex'), '55000a0701eba5c87f710faabbccdd0001ffffffff470085', '')
      })
      it('an empty packet SHOULD be a NOP', function () {
        var packet = new Packets.RadioERP1()
        packet.load({
          packetTypeNumber: 3,
          data: Buffer.from('a5c87f710fffdba5e400', 'hex'),
          optionalData: Buffer.from('01ffffffff4700', 'hex')
        })
        packet.load()
        assert.equal(packet.getRawBuffer().toString('hex'), '55000a0701eba5c87f710fffdba5e40001ffffffff47000d', '')
      })
    })
  })
})
