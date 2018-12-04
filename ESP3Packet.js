'use strict'

class ESP3Packet {
  constructor () {
    this.syncByte = 0x55
    this.header = {
      dataLength: undefined,
      optionalLength: undefined,
      packetType: undefined
    }
    this.crc8Header = undefined
    this.data = undefined
    this.optionalData = undefined
    this.crc8Data = undefined
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
}

class RadioERP1 extends ESP3Packet {
  constructor (esp3Packet) {
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = 'RADIO_ERP1'
    this.packetTypeNumber = 1
    this.RORG = this.data[0]
    this.senderId = this.data.slice(this.data.length - 5, this.data.length - 1).toString('hex')
    this.status = this.data[this.data.length - 1]
    this.subTelNum = this.optionalData[0]
    this.destinationID = this.optionalData.slice(1, 5).toString('hex')
    this.RSSI = this.optionalData[this.optionalData.length - 2]
    this.securityLevel = this.optionalData[this.optionalData.length - 1]
  }
}

class Response extends ESP3Packet {
  constructor (esp3Packet) {
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = 'RESPONSE'
    this.packetTypeNumber = 2
    const responseTypes = [
      { number: 0, name: 'RET_OK' },
      { number: 1, name: 'RET_ERROR' },
      { number: 2, name: 'RET_NOT_SUPPORTED' },
      { number: 3, name: 'RET_WRONG_PARAM' },
      { number: 4, name: 'RET_OPERATION_DENIED' },
      { number: 5, name: 'RET_LOCK_SET' },
      { number: 6, name: 'RET_BUFFER_TO_SMALL' },
      { number: 7, name: 'RET_NO_FREE_BUFFER' }
    ]
    this.responseType = responseTypes[this.data[0]]
  }
}

class Event extends ESP3Packet {
  constructor (esp3Packet) {
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = 'EVENT'
    this.packetTypeNumber = 4
    const eventTypes = [
      { number: 0, name: 'undefined' },
      { number: 1, name: 'SA_RECLAIM_NOT_SUCCESSFUL' },
      { number: 2, name: 'SA_CONFIRM_LEARN' },
      { number: 3, name: 'SA_LEARN_ACK' },
      { number: 4, name: 'CO_READY' },
      { number: 5, name: 'CO_EVENT_SECUREDEVICES' },
      { number: 6, name: 'CO_DUTYCYCLE_LIMITCO_TRANSMIT_FAILED' }
    ]
    this.eventType = eventTypes[this.data[0]]
  }
}

class CommonCommand extends ESP3Packet {
  constructor (esp3Packet) {
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = 'COMMON_COMMAND'
    this.packetTypeNumber = 5
    const commandTypes = [
      { number: 0, name: 'undefiend' },
      { number: 1, name: 'CO_WR_SLEEP' },
      { number: 2, name: 'CO_WR_RESET' },
      { number: 3, name: 'CO_RD_VERSION' },
      { number: 4, name: 'CO_RD_SYS_LOG' },
      { number: 5, name: 'CO_WR_SYS_LOG' },
      { number: 6, name: 'CO_WR_BIST' },
      { number: 7, name: 'CO_WR_IDBASE' },
      { number: 8, name: 'CO_RD_IDBASE' },
      { number: 9, name: 'CO_WR_REPEATER' },
      { number: 10, name: 'CO_RD_REPEATER' },
      { number: 11, name: 'CO_WR_FILTER_ADD' },
      { number: 12, name: 'CO_WR_FILTER_DEL' },
      { number: 13, name: 'CO_WR_FILTER_DEL_ALL' },
      { number: 14, name: 'CO_WR_FILTER_ENABLE' },
      { number: 15, name: 'CO_RD_FILTER' },
      { number: 16, name: 'CO_WR_WAIT_MATURITY' },
      { number: 17, name: 'CO_WR_SUBTEL' },
      { number: 18, name: 'CO_WR_MEM' },
      { number: 19, name: 'CO_RD_MEM' },
      { number: 20, name: 'CO_RD_MEM_ADDRESS' },
      { number: 21, name: 'CO_RD_SECURITY' },
      { number: 22, name: 'CO_WR_SECURITY' },
      { number: 23, name: 'CO_WR_LEARNMODE' },
      { number: 24, name: 'CO_RD_LEARNMODE' },
      { number: 25, name: 'CO_WR_SECUREDEVICE_ADD' },
      { number: 26, name: 'CO_WR_SECUREDEVICE_DEL' },
      { number: 27, name: 'CO_RD_SECUREDEVICE_BY_INDEX' },
      { number: 28, name: 'CO_WR_MODE' },
      { number: 29, name: 'CO_RD_NUMSECUREDEVICES' },
      { number: 30, name: 'CO_RD_SECUREDEVICE_BY_ID' },
      { number: 31, name: 'CO_WR_SECUREDEVICE_ADD_PSK' },
      { number: 32, name: 'CO_WR_SECUREDEVICE_SENDTEACHIN' },
      { number: 33, name: 'CO_WR_TEMPORARY_RLC_WINDOW' },
      { number: 34, name: 'CO_RD_SECUREDEVICE_PSK' },
      { number: 35, name: 'CO_RD_DUTYCYCLE_LIMIT' },
      { number: 37, name: 'CO_SET_BAUDRATE' },
      { number: 38, name: 'CO_GET_FREQUENCY_INFO' },
      { number: 40, name: 'Reserved' },
      { number: 41, name: 'CO_GET_STEPCODE' },
      { number: 42, name: 'Reserved' },
      { number: 43, name: 'Reserved' },
      { number: 44, name: 'Reserved' },
      { number: 45, name: 'Reserved' },
      { number: 46, name: 'Reserved' },
      { number: 47, name: 'Reserved' },
      { number: 48, name: 'CO_WR_REMAN_CODE' },
      { number: 49, name: 'CO_WR_STARTUP_DELAY' },
      { number: 50, name: 'CO_WR_REMAN_REPEATING' },
      { number: 51, name: 'CO_RD_REMAN_REPEATING' },
      { number: 52, name: 'CO_SET_NOISETHRESHOLD' },
      { number: 53, name: 'CO_GET_NOISETHRESHOLD' }
    ]
    this.commandType = commandTypes[this.data[0]]
  }
}

class SmartAckCommand extends ESP3Packet {
  constructor (esp3Packet) {
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = 'SMART_ACK_COMMAND'
    this.packetTypeNumber = 6
    const commandTypes = [
      { number: 0, name: 'undefined' },
      { number: 1, name: 'SA_WR_LEARNMODE' },
      { number: 2, name: 'SA_RD_LEARNMODE' },
      { number: 3, name: 'SA_WR_LEARNCONFIRM' },
      { number: 4, name: 'SA_WR_CLIENTLEARNRQ' },
      { number: 5, name: 'SA_WR_RESET' },
      { number: 6, name: 'SA_RD_LEARNEDCLIENTS' },
      { number: 7, name: 'SA_WR_RECLAIMS' },
      { number: 8, name: 'SA_WR_POSTMASTER' }
    ]
    this.commandType = commandTypes[this.data[0]]
  }
}
class RemoteManCommand extends ESP3Packet {
  constructor (esp3Packet) {
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = 'REMOTE_MAN_COMMAND'
    this.packetTypeNumber = 7
    this.function = parseInt(this.data.slice(0, 2).toString('hex'), 16)
    this.manufacturerID = parseInt(this.data.slice(2, 4).toString('hex'), 16)
    this.msg = this.data.slice(4, this.data.length)
    this.destinationID = this.optionalData.slice(0, 4).toString('hex')
    this.sourceID = this.optionalData.slice(4, 8).toString('hex')
    this.RSSI = this.optionalData[this.optionalData.length - 2]
    this.sendWithDelay = this.optionalData[this.optionalData.length - 1]
  }
}
class RadioMessage extends ESP3Packet {
  constructor (esp3Packet) {
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = 'RADIO_MESSAGE'
    this.packetTypeNumber = 9
    this.RORG = this.data[0]
    this.content = this.data.slice(1, this.data.length)
    this.destinationID = this.optionalData.slice(0, 4).toString('hex')
    this.sourceID = this.optionalData.slice(4, 8).toString('hex')
    this.RSSI = this.optionalData[this.optionalData.length - 2]
    this.securityLevel = this.optionalData[this.optionalData.length - 1]
  }
}

module.exports = {
  'ESP3Packet': ESP3Packet,
  'RadioERP1': RadioERP1,
  'Response': Response,
  'Event': Event,
  'CommonCommand': CommonCommand,
  'SmartAckCommand': SmartAckCommand,
  'RemoteManCommand': RemoteManCommand,
  'RadioMessage': RadioMessage

}
