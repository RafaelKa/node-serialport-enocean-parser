/* eslint-disable no-undef  */
const buffer2struct = require('../ESP3/buffer2struct.js')
const assert = require('assert')
describe('The Helper Function', function () {
  describe('buffer2struct', function () {
    it('SHOULD return filled packet structs from raw buffers', function () {
      var struct = buffer2struct(Buffer.from('55000a0701eba5c87f710fffdba5e40001ffffffff47000d', 'hex'))
      assert(struct.syncByte, 0x55)
      assert(struct.header.dataLength, 0x0a)
      assert(struct.header.optionalLength, 0x07)
      assert(struct.header.packetType, 0x01)
      assert(struct.crc8Header, 0xeb)
      assert(struct.data.toString('hex'), 'a5c87f710fffdba5e400')
      assert(struct.optionalData.toString('hex'), '01ffffffff4700')
      assert(struct.crc8Data, 0x0d)
    })
  })
})
