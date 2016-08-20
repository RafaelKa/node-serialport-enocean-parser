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
 * |    Header     |   2    Data length          |
 * |               |   +                         |
 * |               |   1    Optional Data length |
 * |               |   +                         |
 * |               |   1    Packet type          |
 * +---------------+ - + - ----------------------+
 * |  CRC8 Header  |   1
 * +---------------+ - + -
 * |     Data      |
 * |               |   1
 * |               |   +
 * |               |   X
 * |               |
 * +---------------+ - + -
 * | Optional Data |
 * |               |   0
 * |               |   +
 * |               |   Y
 * |               |
 * +---------------+ - + -
 * |   CRC8 Data   |   1
 * +---------------+ -----
 *
 */
module.exports = ESP3Packet;

function ESP3Packet() {
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
	this.getRawBuffer = function () {
		return Buffer.concat(
			[
				this.syncByte,
				this.header.dataLength,
				this.header.optionalLength,
				this.header.packetType,
				this.crc8Header,
				this.data,
				this.optionalData,
				this.crc8Data
			],
			8 + this.header.dataLength + this.header.optionalLength
		);
	}
};
