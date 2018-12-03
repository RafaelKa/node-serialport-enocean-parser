/*jslint node: true */
"use strict";

/**
 * ESP3 packet structure through the serial port.
 *
 * Sync  is 0x55
 * CRC8H is CRC8 for ‘Header’
 * CRC8D is CRC8 for ‘Datas’ (Data and Optional Data)
 *
 *                   bytes
 *                     ▼
 * +---------------+ -----
 * |   Sync Byte   |   1
 * +---------------+ - + - ----------------------+
 * |               |   2    Data length          |
 * |               |   +                         |
 * |    Header     |   1    Optional Data length |
 * |               |   +                         |
 * |               |   1    Packet type          |
 * +---------------+ - + - ----------------------+
 * |  CRC8 Header  |   1
 * +---------------+ - + -
 * |               |
 * |               |
 * |     Data      |   X
 * |               |
 * |               |
 * +---------------+ - + -
 * |               |
 * |               |
 * | Optional Data |   Y
 * |               |
 * |               |
 * +---------------+ - + -
 * |   CRC8 Data   |   1
 * +---------------+ -----
 *
 * also full ESP3 Packet Length = 7 + X(Data length) + Y(Optional Data length)
 */

class ESP3Packet {
	constructor(){
		this.syncByte = 0x55;
		this.header = {
			dataLength: undefined,
			optionalLength: undefined,
			packetType: undefined
		},
		this.crc8Header = undefined;
		this.data = undefined;
		this.optionalData = undefined;
		this.crc8Data = undefined;
	}
	getRawBuffer() {
		var dataLengthBuffer = Buffer.alloc(2);
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
		);
	}
};

class Radio_ERP1 extends ESP3Packet{
	constructor(esp3Packet){
		super()
		this.syncByte = 0x55;
		this.header = esp3Packet.header,
		this.crc8Header = esp3Packet.crc8Header;
		this.data = esp3Packet.data;
		this.optionalData = esp3Packet.optionalData;
		this.crc8Data = esp3Packet.crc8Data;
		this.packetTypeName = "RADIO_ERP1"
		this.RORG = this.data[0]
		this.senderId = this.data.slice(this.data.length-5,this.data.length-1).toString("hex")
		this.status = this.data[this.data.length-1]
		if(this.optionalData.length>0){
			this.subTelNum = this.optionalData[0]
			this.destinationID = this.optionalData.slice(1,5).toString("hex")
			this.dBm = this.optionalData[this.optionalData.length-2]
			this.securityLevel = this.optionalData[this.optionalData.length-1]
		}
	}
}

class Response extends ESP3Packet{
	constructor(esp3Packet){
		super()
		this.syncByte = 0x55;
		this.header = esp3Packet.header,
		this.crc8Header = esp3Packet.crc8Header;
		this.data = esp3Packet.data;
		this.optionalData = esp3Packet.optionalData;
		this.crc8Data = esp3Packet.crc8Data;
		this.packetTypeName = "RESPONSE"
		const CodeNames = ["RET_OK OK", "RET_ERROR", "RET_NOT_SUPPORTED", "RET_WRONG_PARAM", "RET_OPERATION_DENIED", "RET_LOCK_SET", "RET_BUFFER_TO_SMALL", "RET_NO_FREE_BUFFER"]
		this.returnCode = this.data[0]
		this.codeName = CodeNames[this.returnCode]
	}
}

class Event extends ESP3Packet{
	constructor(esp3Packet){
		super()
		this.syncByte = 0x55;
		this.header = esp3Packet.header,
		this.crc8Header = esp3Packet.crc8Header;
		this.data = esp3Packet.data;
		this.optionalData = esp3Packet.optionalData;
		this.crc8Data = esp3Packet.crc8Data;
		this.packetTypeName = "EVENT"
		const EventNames = ["","SA_RECLAIM_NOT_SUCCESSFUL", "SA_CONFIRM_LEARN", "SA_LEARN_ACK", "CO_READY", "CO_EVENT_SECUREDEVICES", "CO_DUTYCYCLE_LIMITCO_TRANSMIT_FAILED"]
		this.eventCode = this.data[0]
		this.codeName = EventNames[this.returnCode]
	}
}

class Common_Command extends ESP3Packet{
	constructor(esp3Packet){
		super()
		this.syncByte = 0x55;
		this.header = esp3Packet.header,
		this.crc8Header = esp3Packet.crc8Header;
		this.data = esp3Packet.data;
		this.optionalData = esp3Packet.optionalData;
		this.crc8Data = esp3Packet.crc8Data;
		this.packetTypeName = "COMMON_COMMAND"
		const CommandNames = ["","CO_WR_SLEEP", "CO_WR_RESET", "CO_RD_VERSION", "CO_RD_SYS_LOG", "CO_WR_SYS_LOG", "CO_WR_BIST", "CO_WR_IDBASE", "CO_RD_IDBASE", "CO_WR_REPEATER", "CO_RD_REPEATER", "CO_WR_FILTER_ADD", "CO_WR_FILTER_DEL", "CO_WR_FILTER_DEL_ALL", "CO_WR_FILTER_ENABLE", "CO_RD_FILTER", "CO_WR_WAIT_MATURITY", "CO_WR_SUBTEL", "CO_WR_MEM", "CO_RD_MEM", "CO_RD_MEM_ADDRESS", "CO_RD_SECURITY", "CO_WR_SECURITY","CO_WR_LEARNMODE", "CO_RD_LEARNMODE", "CO_WR_SECUREDEVICE_ADD", "CO_WR_SECUREDEVICE_DEL", "CO_RD_SECUREDEVICE_BY_INDEX", "CO_WR_MODE", "CO_RD_NUMSECUREDEVICES", "CO_RD_SECUREDEVICE_BY_ID", "CO_WR_SECUREDEVICE_ADD_PSK", "CO_WR_SECUREDEVICE_SENDTEACHIN", "CO_WR_TEMPORARY_RLC_WINDOW", "CO_RD_SECUREDEVICE_PSK", "CO_RD_DUTYCYCLE_LIMIT", "CO_SET_BAUDRATE", "CO_GET_FREQUENCY_INFO", "Reserved", "CO_GET_STEPCODE", "Reserved", "Reserved", "Reserved", "Reserved", "Reserved", "Reserved", "CO_WR_REMAN_CODE", "CO_WR_STARTUP_DELAY", "CO_WR_REMAN_REPEATING", "CO_RD_REMAN_REPEATING", "CO_SET_NOISETHRESHOLD", "CO_GET_NOISETHRESHOLD"]
		this.commandCode = this.data[0]
		this.codeName = CommandNames[this.returnCode]
	}
}

class Smart_Ack_Command extends ESP3Packet{
	constructor(esp3Packet){
		super()
		this.syncByte = 0x55;
		this.header = esp3Packet.header,
		this.crc8Header = esp3Packet.crc8Header;
		this.data = esp3Packet.data;
		this.optionalData = esp3Packet.optionalData;
		this.crc8Data = esp3Packet.crc8Data;
		this.packetTypeName = "SMART_ACK_COMMAND"
		const CommandNames = ["","SA_WR_LEARNMODE","SA_RD_LEARNMODE","SA_WR_LEARNCONFIRM","SA_WR_CLIENTLEARNRQ","SA_WR_RESET","SA_RD_LEARNEDCLIENTS","SA_WR_RECLAIMS","SA_WR_POSTMASTER"]
		this.commandCode = this.data[0]
		this.codeName = CommandNames[this.returnCode]
	}
}

module.exports = {
	"ESP3Packet" : ESP3Packet,
	"Radio_ERP1" : Radio_ERP1,
	"Response" : Response,
	"Event" : Event,
	"Common_Command" : Common_Command
};
