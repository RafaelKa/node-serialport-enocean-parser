'use strict'
/* eslint-disable no-undef  */
const assert = require('chai').assert
const sinon = require('sinon')

const ESP3Parser = require('../ESP3Parser')
const esp3parser = new ESP3Parser()

const telegrams = [
  '55000a0701eba5c87f710fffdba5e40001ffffffff47000d', // 0 | _4BS_A5
  '55000707017ad509ffdba5ed0001ffffffff470096', // 1 | _1BS_D5
  '55000c070196d24000b00a010001a03d790001ffffffff5b0033', // 2 | _VLD_D2
  '55000707017af600ffd9b7812001ffffffff460050', // 3 | _RPS_F6
  '55000a0701eba540300287ffd9b7e50001ffffffff440016' // 4 | _4BS_Teach_In_A5
]

describe('serialport enocean parser', function () {
  describe('ESP3 Parser', function () {
    describe('from proper byte stream:', function () {
      it('can fetch all ESP3 packets', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        for (let key in telegrams) {
          let telegramm = Buffer.from(telegrams[key], 'hex')
          esp3parser.write(telegramm)
          assert.deepEqual(spy.getCall(key).args[0].getRawBuffer(), telegramm)
        }
      })

      it('can fetch all ESP3 packets in large byte stream', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        const telegramsAsBuffer = telegrams.slice(0).map(telegramAsString => Buffer.from(telegramAsString, 'hex'))
        const largeByteStream = Buffer.concat(telegramsAsBuffer)

        esp3parser.write(largeByteStream)
        assert.equal(spy.callCount, telegrams.length, 'Received unexpected count of packets.')
      })
    })

    describe('from messy byte stream:', function () {
      /**
       * ESP3 defines: "If the Header does not match the CRC8H, the value 0x55 does not correspond to Sync.-Byte.
       * The next 0x55 within the data stream is picked and the verification repeated."
       */
      it('packets MUST be emitted, if messy bytes occur before the header was detected and there are at least 5 bytes to real sync byte', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy).on('error', err => err)
        const messyBytes = [ // ESP3 can lose packets if 0x55 occurs in lesser than 5 bytes to real sync byte, therefore no 0x55 is defined on dangerous offsets.
          '55a03d790001',
          '557017af60ff',
          '55a010001a03',
          '55af600ffd9b7812001f',
          '55707017af600ffd9b7812001ffc',
          '550707017ad509ffdba5ed0001ffffffdf'
        ]
        const messyBytesBetweenTelegramsAsBuffer = telegrams.slice(0).map(
          telegramAsString => Buffer.from(
            messyBytes[Math.floor(Math.random() * messyBytes.length)] + telegramAsString,
            'hex'
          )
        )
        const largeAndMessyByteStream = Buffer.concat(messyBytesBetweenTelegramsAsBuffer)

        esp3parser.write(largeAndMessyByteStream)
        assert.equal(spy.callCount, telegrams.length, 'Received unexpected count of packets.')
        // assert.equal(error_spy.callCount, telegrams.length, 'Received unexpected count of packets.')
      })

      it('packet SHOULD NOT be emitted, if data or optional data is invalid', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)

        const withBrokenCRC8Data = telegrams.slice(0).map(
          telegramAsString => Buffer.from(
            telegramAsString.substring(0, telegramAsString.length - 2) + '00',
            'hex'
          )
        )
        const byteStream = Buffer.concat(withBrokenCRC8Data)
        esp3parser.write(byteStream)
        assert.equal(spy.callCount, 0, 'Broken packets are emitted.')
      })
      it('an error SCHOULD be emmited if the checksum tests fail', function () {
        const spy = sinon.spy()
        esp3parser.on('error', spy)

        const wrongHeaderChecksum = Buffer.from('5500010005710838', 'hex')
        const wrongBodyChecksum = Buffer.from('5500010005700839', 'hex')

        esp3parser.write(wrongHeaderChecksum)
        esp3parser.write(wrongBodyChecksum)

        assert.equal(spy.args[0][0].code, 1, 'Broken packets are emitted.')
        assert.equal(spy.args[1][0].code, 2, 'Broken packets are emitted.')
      })
    })
  })
})
