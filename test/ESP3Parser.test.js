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
        esp3parser.removeListener('data', spy)
      })

      it('can fetch all ESP3 packets in large byte stream', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        const telegramsAsBuffer = telegrams.slice(0).map(telegramAsString => Buffer.from(telegramAsString, 'hex'))
        const largeByteStream = Buffer.concat(telegramsAsBuffer)

        esp3parser.write(largeByteStream)
        assert.equal(spy.callCount, telegrams.length, 'Received unexpected count of packets.')
        esp3parser.removeListener('data', spy)
      })
    })

    describe('from messy byte stream:', function () {
      /**
       * ESP3 defines: "If the Header does not match the CRC8H, the value 0x55 does not correspond to Sync.-Byte.
       * The next 0x55 within the data stream is picked and the verification repeated."
       */
      it('packets MUST be emitted, if messy bytes occur before the header was detected and there are at least 5 bytes to real sync byte', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)

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
        esp3parser.removeListener('data', spy)
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
        esp3parser.removeListener('data', spy)
      })
    })

    describe('ESP3 Packets of type:', function () {
      it('SMART_ACK_COMMAND SHOULD be emitted as SmartAckCommand Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('55000700060401010000000500b7', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'SmartAckCommand', 'Packet not a SMART_ACK_COMMAND')
        assert.equal(spy.args[0][0].packetTypeNumber, 6, '')
        esp3parser.removeListener('data', spy)
      })
      it('COMMON_COMMAND SHOULD be emitted as CommonCommand Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('5500010005700838', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'CommonCommand', 'Packet not a COMMON_COMMAND')
        assert.equal(spy.args[0][0].packetTypeNumber, 5, '')
        assert.equal(spy.args[0][0].commandType.number, 8, '')
        esp3parser.removeListener('data', spy)
      })
      it('RADIO_ERP1 SHOULD be emitted as RadioERP1 Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('55000a0701eba5c87f710fffdba5e40001ffffffff47000d', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'RadioERP1', 'Packet not a RADIO_ERP1')
        assert.equal(spy.args[0][0].packetTypeNumber, 1, '')
        assert.equal(spy.args[0][0].senderId, 'ffdba5e4', '')
        assert.equal(spy.args[0][0].status, 0, '')
        assert.equal(spy.args[0][0].subTelNum, 1, '')
        assert.equal(spy.args[0][0].destinationID, 'ffffffff', '')
        assert.equal(spy.args[0][0].RSSI, 0x47, '')
        assert.equal(spy.args[0][0].securityLevel, 0, '')
        esp3parser.removeListener('data', spy)
      })
      it('RESPONSE SHOULD be emitted as Response Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('5500010002650000', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'Response', 'Packet not a RESPONSE')
        assert.equal(spy.args[0][0].packetTypeNumber, 2, '')
        assert.equal(spy.args[0][0].responseType.number, 0, 'wrong type number')
        assert.equal(spy.args[0][0].responseType.name, 'RET_OK', 'wrong type name')
        esp3parser.removeListener('data', spy)
      })
      it('EVENT SHOULD be emitted as Event Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('550001000477041c', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'Event', 'Packet not an EVENT')
        assert.equal(spy.args[0][0].packetTypeNumber, 4, '')
        assert.equal(spy.args[0][0].eventType.number, 4, 'wrong type number')
        assert.equal(spy.args[0][0].eventType.name, 'CO_READY', 'wrong type name')
        esp3parser.removeListener('data', spy)
      })
      it('RADIO_MESSAGE SHOULD be emitted as RadioMessage Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('55000d0a092ca048656c6c6f20576f726c6421ffffffffdc3d552ca000c9', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'RadioMessage', 'Packet not a RADIO_MESSAGE')
        assert.equal(spy.args[0][0].packetTypeNumber, 9, '')
        assert.equal(spy.args[0][0].RORG, 0xa0, '')
        assert.equal(spy.args[0][0].content.toString(), 'Hello World!', '')
        assert.equal(spy.args[0][0].sourceID, 'dc3d552c', '')
        assert.equal(spy.args[0][0].destinationID, 'ffffffff', '')
        assert.equal(spy.args[0][0].RSSI, 0xa0, '')
        assert.equal(spy.args[0][0].securityLevel, 0, '')
        esp3parser.removeListener('data', spy)
      })
      it('REMOTE_MAN_COMMAND SHOULD be emitted as RemoteManCommand Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('5500070a0781010200ffabcdefffffffffaabbccdd420025', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'RemoteManCommand', 'Packet not a REMOTE_MAN_COMMAND')
        assert.equal(spy.args[0][0].packetTypeNumber, 7, 'wrong packet number')
        assert.equal(spy.args[0][0].function, 0x0102, 'wrong function')
        assert.equal(spy.args[0][0].manufacturerID, 0xff, 'wrong manufacturer')
        assert.equal(spy.args[0][0].sourceID, 'aabbccdd', 'wrong source Id')
        assert.equal(spy.args[0][0].destinationID, 'ffffffff', 'wrong destination Id')
        assert.equal(spy.args[0][0].RSSI, 0x42, 'wrong RSSI')
        assert.equal(spy.args[0][0].sendWithDelay, 0, 'wrong "send with delay" switch')
        esp3parser.removeListener('data', spy)
      })
      it('RADIO_ERP2 SHOULD be emitted as RadioERP2 Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('550004030aa2aabbccdd015300a7', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'RadioERP2', 'Packet not a RADIO_ERP2')
        assert.equal(spy.args[0][0].packetTypeNumber, 10, 'wrong packet number')
        assert.equal(spy.args[0][0].RSSI, 0x53, 'wrong RSSI')
        assert.equal(spy.args[0][0].subTelNum, 1, 'wrong SubTel count')
        assert.equal(spy.args[0][0].securityLevel, 0, 'wrong Security Level')
        esp3parser.removeListener('data', spy)
      })
      it('RADIO_802_15_4 SHOULD be emitted as Radio802 Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('5500040110ceaabbccdd7148', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'Radio802', 'Packet not a RADIO_802_15_4')
        assert.equal(spy.args[0][0].packetTypeNumber, 16, '')
        assert.equal(spy.args[0][0].RSSI, 0x71, 'wrong RSSI')
        esp3parser.removeListener('data', spy)
      })
      it('Command_2_4 SHOULD be emitted as Command24 Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('5500020011a101157e', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'Command24', 'Packet not a RADIO_802_15_4')
        assert.equal(spy.args[0][0].packetTypeNumber, 17, '')
        assert.equal(spy.args[0][0].channel, 0x15, '')
        esp3parser.removeListener('data', spy)
      })
      it('RADIO_SUB_TEL SHOULD be emitted as RadioSubTel Object', function () {
        const spy = sinon.spy()
        esp3parser.on('data', spy)
        esp3parser.write(Buffer.from('550007120362f670aabbccdd0103ffffffff45000000104300124500114100be', 'hex'))
        assert.equal(spy.args[0][0].constructor.name, 'RadioSubTel', 'Packet not a RadioSubTel')
        assert.equal(spy.args[0][0].subTelGroups.length, 3, 'Packet not a RadioSubTel')
        assert.equal(spy.args[0][0].subTelGroups[0].tick, 0x10, 'Packet not a RadioSubTel')
        assert.equal(spy.args[0][0].subTelGroups[1].RSSI, 0x45, 'Packet not a RadioSubTel')
        assert.equal(spy.args[0][0].subTelGroups[2].status, 0, 'Packet not a RadioSubTel')
        esp3parser.removeListener('data', spy)
      })
    })
  })
})
