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

module.exports = ESP3Packet;
