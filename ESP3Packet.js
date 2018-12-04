"use strict"

class ESP3Packet {
  constructor(){
    this.syncByte = 0x55
    this.header = {
      dataLength: undefined,
      optionalLength: undefined,
      packetType: undefined
    },
    this.crc8Header = undefined
    this.data = undefined
    this.optionalData = undefined
    this.crc8Data = undefined
  }
  getRawBuffer() {
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

class RadioERP1 extends ESP3Packet{
  constructor(esp3Packet){
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header,
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = "RADIO_ERP1"
    this.packetTypeNumber = 1
    this.RORG = this.data[0]
    this.senderId = this.data.slice(this.data.length-5,this.data.length-1).toString("hex")
    this.status = this.data[this.data.length-1]
    this.subTelNum = this.optionalData[0]
    this.destinationID = this.optionalData.slice(1,5).toString("hex")
    this.RSSI = this.optionalData[this.optionalData.length-2]
    this.securityLevel = this.optionalData[this.optionalData.length-1]
  }
}

class Response extends ESP3Packet{
  constructor(esp3Packet){
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header,
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = "RESPONSE"
    this.packetTypeNumber = 2
    const CodeNames = {
      0: "RET_OK",
      1: "RET_ERROR",
      2: "RET_NOT_SUPPORTED",
      3: "RET_WRONG_PARAM",
      4: "RET_OPERATION_DENIED",
      5: "RET_LOCK_SET",
      6: "RET_BUFFER_TO_SMALL",
      7: "RET_NO_FREE_BUFFER"
    }
    this.returnCode = this.data[0]
    this.codeName = CodeNames[this.returnCode]
  }
}

class Event extends ESP3Packet{
  constructor(esp3Packet){
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header,
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = "EVENT"
    this.packetTypeNumber = 4
    const EventNames = {
      1: "SA_RECLAIM_NOT_SUCCESSFUL",
      2: "SA_CONFIRM_LEARN",
      3: "SA_LEARN_ACK",
      4: "CO_READY",
      5: "CO_EVENT_SECUREDEVICES",
      6: "CO_DUTYCYCLE_LIMITCO_TRANSMIT_FAILED"
    }
    this.eventCode = this.data[0]
    this.codeName = EventNames[this.returnCode]
  }
}

class CommonCommand extends ESP3Packet{
  constructor(esp3Packet){
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header,
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = "COMMON_COMMAND"
    this.packetTypeNumber = 5
    const CommandNames = {
      1: "CO_WR_SLEEP",
      2: "CO_WR_RESET",
      3: "CO_RD_VERSION",
      4: "CO_RD_SYS_LOG",
      5: "CO_WR_SYS_LOG",
      6: "CO_WR_BIST",
      7: "CO_WR_IDBASE",
      8: "CO_RD_IDBASE",
      9: "CO_WR_REPEATER",
      10: "CO_RD_REPEATER",
      11: "CO_WR_FILTER_ADD",
      12: "CO_WR_FILTER_DEL",
      13: "CO_WR_FILTER_DEL_ALL",
      14: "CO_WR_FILTER_ENABLE",
      15: "CO_RD_FILTER",
      16: "CO_WR_WAIT_MATURITY",
      17: "CO_WR_SUBTEL",
      18: "CO_WR_MEM",
      19: "CO_RD_MEM",
      20: "CO_RD_MEM_ADDRESS",
      21: "CO_RD_SECURITY",
      22: "CO_WR_SECURITY",
      23: "CO_WR_LEARNMODE",
      24: "CO_RD_LEARNMODE",
      25: "CO_WR_SECUREDEVICE_ADD",
      26: "CO_WR_SECUREDEVICE_DEL",
      27: "CO_RD_SECUREDEVICE_BY_INDEX",
      28: "CO_WR_MODE",
      29: "CO_RD_NUMSECUREDEVICES",
      30: "CO_RD_SECUREDEVICE_BY_ID",
      31: "CO_WR_SECUREDEVICE_ADD_PSK",
      32: "CO_WR_SECUREDEVICE_SENDTEACHIN",
      33: "CO_WR_TEMPORARY_RLC_WINDOW",
      34: "CO_RD_SECUREDEVICE_PSK",
      35: "CO_RD_DUTYCYCLE_LIMIT",
      37: "CO_SET_BAUDRATE",
      38: "CO_GET_FREQUENCY_INFO",
      40: "Reserved",
      41: "CO_GET_STEPCODE",
      42: "Reserved",
      43: "Reserved",
      44: "Reserved",
      45: "Reserved",
      46: "Reserved",
      47: "Reserved",
      48: "CO_WR_REMAN_CODE",
      49: "CO_WR_STARTUP_DELAY",
      50: "CO_WR_REMAN_REPEATING",
      51: "CO_RD_REMAN_REPEATING",
      52: "CO_SET_NOISETHRESHOLD",
      53: "CO_GET_NOISETHRESHOLD"
    }
    this.commandCode = this.data[0]
    this.codeName = CommandNames[this.returnCode]
  }
}

class SmartAckCommand extends ESP3Packet{
  constructor(esp3Packet){
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header,
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = "SMART_ACK_COMMAND"
    this.packetTypeNumber = 6
    const CommandNames = {
      1: "SA_WR_LEARNMODE",
      2: "SA_RD_LEARNMODE",
      3: "SA_WR_LEARNCONFIRM",
      4: "SA_WR_CLIENTLEARNRQ",
      5: "SA_WR_RESET",
      6: "SA_RD_LEARNEDCLIENTS",
      7: "SA_WR_RECLAIMS",
      8: "SA_WR_POSTMASTER"
    }
    this.commandCode = this.data[0]
    this.codeName = CommandNames[this.returnCode]
  }
}

class RadioMessage extends ESP3Packet{
  constructor(esp3Packet){
    super()
    this.syncByte = 0x55
    this.header = esp3Packet.header,
    this.crc8Header = esp3Packet.crc8Header
    this.data = esp3Packet.data
    this.optionalData = esp3Packet.optionalData
    this.crc8Data = esp3Packet.crc8Data
    this.packetTypeName = "RADIO_MESSAGE"
    this.packetTypeNumber = 9
    this.RORG = this.data[0]
    this.content = this.data.slice(1,this.data.length)
    this.subTelNum = this.optionalData[0]
    this.destinationID = this.optionalData.slice(0,4).toString("hex")
    this.sourceID = this.optionalData.slice(4,8).toString("hex")
    this.RSSI = this.optionalData[this.optionalData.length-2]
    this.securityLevel = this.optionalData[this.optionalData.length-1]
  }
}

module.exports = {
  "ESP3Packet" : ESP3Packet,
  "RadioERP1" : RadioERP1,
  "Response" : Response,
  "Event" : Event,
  "CommonCommand" :CommonCommand,
  "SmartAckCommand" : SmartAckCommand,
  "RadioMessage" : RadioMessage
}
