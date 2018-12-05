// 'use strict' not needed anymore because strict mode is implicit in classes

// Copyright 2015 Rafael Kähm <rafael@kaehms.de>
// Copyright 2018 Holger Will <h.will@klimapartner.de>

const Transform = require('stream').Transform
const Packets = require('./Packet')
const getCrc8 = require('./ESP3/crc8.js')

// Emit a data event by recognizing ESP3 packets
// Data contains ESP3Packet
// More: https://www.enocean.com/fr/knowledge-base-doku/enoceansystemspecification:issue:faqesp2esp3/?purge=1

class ESP3Parser extends Transform {
  constructor (options = {}) {
    super({ ...options, ...{ readableObjectMode: true } })
    this.currentESP3Packet = new Packets.ESP3Packet()
    this.tmp = null
    this.callbackForNextByte = this.waitForSyncByte
  }
  _transform (chunk, encoding, cb) {
    for (var offset = 0; offset < chunk.length; offset++) {
      this.callbackForNextByte(chunk[offset])
    }
    cb()
  }
  waitForSyncByte (byte) {
    if (byte !== 0x55) {
      return
    }
    this.tmp = {
      'header': Buffer.alloc(4),
      'headerOffset': 0,
      'dataOffset': 0,
      'optionalDataOffset': 0
    }
    this.currentESP3Packet = new Packets.ESP3Packet()
    this.callbackForNextByte = this.fillHeader
  }

  fillHeader (byte) {
    if (this.tmp.headerOffset < 3) {
      this.tmp.header.fill(byte, this.tmp.headerOffset)
      this.tmp.headerOffset++
      return
    }
    this.tmp.header.fill(byte, this.tmp.headerOffset)
    this.currentESP3Packet.header.dataLength = Buffer.from([this.tmp.header[0], this.tmp.header[1]]).readUInt16BE(0)
    this.currentESP3Packet.header.optionalLength = this.tmp.header[2]
    this.currentESP3Packet.header.packetType = this.tmp.header[3]
    this.callbackForNextByte = this.fetchCRC8ForHeaderAndCheck
  }
  fetchCRC8ForHeaderAndCheck (byte) {
    if (getCrc8(this.tmp.header) !== byte) {
      this.callbackForNextByte = this.waitForSyncByte
      this.emit('error', {
        code: 1,
        name: 'WRONG_HEADER_CHECKSUM',
        desc: 'header checksum test failed'
      })
      return
    }
    this.currentESP3Packet.crc8Header = byte
    this.currentESP3Packet.data = Buffer.alloc(this.currentESP3Packet.header.dataLength)
    // @todo: is 0 bytes buffer really needed? -> maybe "if (currentESP3Packet.header.optionalLength > 0)"?
    this.currentESP3Packet.optionalData = Buffer.alloc(this.currentESP3Packet.header.optionalLength)
    this.callbackForNextByte = this.fillData
  }
  fillData (byte) {
    if (this.tmp.dataOffset < this.currentESP3Packet.header.dataLength - 1) {
      this.currentESP3Packet.data.fill(byte, this.tmp.dataOffset)
      this.tmp.dataOffset++
      return
    }
    this.currentESP3Packet.data.fill(byte, this.tmp.dataOffset)

    if (this.currentESP3Packet.header.optionalLength > 0) {
      this.callbackForNextByte = this.fillOptionalData
      return
    }
    this.callbackForNextByte = this.fetchCRC8ForDataAndCheck
  }
  fillOptionalData (byte) {
    if (this.tmp.optionalDataOffset < this.currentESP3Packet.header.optionalLength - 1) {
      this.currentESP3Packet.optionalData.fill(byte, this.tmp.optionalDataOffset)
      this.tmp.optionalDataOffset++
      return
    }
    this.currentESP3Packet.optionalData.fill(byte, this.tmp.optionalDataOffset)
    this.callbackForNextByte = this.fetchCRC8ForDataAndCheck
  }
  fetchCRC8ForDataAndCheck (byte) {
    this.callbackForNextByte = this.waitForSyncByte
    var datas = Buffer.concat(
      [this.currentESP3Packet.data, this.currentESP3Packet.optionalData],
      (this.currentESP3Packet.header.dataLength + this.currentESP3Packet.header.optionalLength)
    )
    if (getCrc8(datas) !== byte) {
      this.emit('error', {
        code: 2,
        name: 'WRONG_BODY_CHECKSUM',
        desc: 'data checksum test failed'
      })
      return
    }
    this.currentESP3Packet.crc8Data = byte
    this._flush()
  }
  _flush () {
    this.push(this.currentESP3Packet)
    this.currentESP3Packet = new Packets.ESP3Packet()
  }
}

class ESP3FullParser extends ESP3Parser {
  _flush () {
    switch (this.currentESP3Packet.header.packetType) {
      case 1:
        this.currentESP3Packet = new Packets.RadioERP1(this.currentESP3Packet)
        break
      case 2:
        this.currentESP3Packet = new Packets.Response(this.currentESP3Packet)
        break
      case 3:
        this.currentESP3Packet = new Packets.RadioSubTel(this.currentESP3Packet)
        break
      case 4:
        this.currentESP3Packet = new Packets.Event(this.currentESP3Packet)
        break
      case 5:
        this.currentESP3Packet = new Packets.CommonCommand(this.currentESP3Packet)
        break
      case 6:
        this.currentESP3Packet = new Packets.SmartAckCommand(this.currentESP3Packet)
        break
      case 7:
        this.currentESP3Packet = new Packets.RemoteManCommand(this.currentESP3Packet)
        break
      case 9:
        this.currentESP3Packet = new Packets.RadioMessage(this.currentESP3Packet)
        break
      case 10:
        this.currentESP3Packet = new Packets.RadioERP2(this.currentESP3Packet)
        break
      case 16:
        this.currentESP3Packet = new Packets.Radio802(this.currentESP3Packet)
        break
      case 17:
        this.currentESP3Packet = new Packets.Command24(this.currentESP3Packet)
        break
    }
    this.push(this.currentESP3Packet)
    this.currentESP3Packet = new Packets.ESP3Packet()
  }
}

module.exports = {
  SimpleParser: ESP3Parser,
  FullParser: ESP3FullParser
}
