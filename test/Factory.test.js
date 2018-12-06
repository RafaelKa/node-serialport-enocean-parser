/* eslint-disable no-undef  */
const Packet = require('../Packet.js')
const assert = require('assert')
describe('Concrete Packets', function () {
  it('SHOULD be creatable from generic ESP3packets', function () {
    var esp3packet = new Packet.ESP3Packet({
      syncByte: 0x55,
      header: {
        dataLength: 1,
        optionalLength: 0,
        packetType: 5
      },
      crc8Header: 0x70,
      data: Buffer.from('08', 'hex'),
      optionalData: Buffer.alloc(0),
      crc8Data: 0x38
    })
    var newPacket = Packet.from(esp3packet)
    assert(newPacket instanceof Packet.CommonCommand, true)
    assert(newPacket.getRawBuffer().toString('hex'), '5500010005700838')
  })
  it('SHOULD be creatable from raw Buffers', function () {
    var newPacket = Packet.from(Buffer.from('5500010005700838', 'hex'))
    assert(newPacket instanceof Packet.CommonCommand, true)
    assert(newPacket.getRawBuffer().toString('hex'), '5500010005700838')
  })
  it('SHOULD be creatable from strings', function () {
    var newPacket = Packet.from('5500010005700838')
    assert(newPacket instanceof Packet.CommonCommand, true)
    assert(newPacket.getRawBuffer().toString('hex'), '5500010005700838')
  })
  it('SHOULD be creatable from ESP3PacketStructs', function () {
    var newPacket = Packet.from({
      syncByte: 0x55,
      header: {
        dataLength: 1,
        optionalLength: 0,
        packetType: 5
      },
      crc8Header: 0x70,
      data: Buffer.from('08', 'hex'),
      optionalData: Buffer.alloc(0),
      crc8Data: 0x38
    })
    assert(newPacket instanceof Packet.CommonCommand, true)
    assert(newPacket.getRawBuffer().toString('hex'), '5500010005700838')
  })
  it('created from invalid packet descriptors SHOULD throw', function () {
    function x () {
      Packet.from({ foo: 'bar' })
    }
    function y () {
      Packet.from({ foo: 'bar' })
    }
    assert.throws(x, Error)
    assert.throws(y, Error)
  })
})
