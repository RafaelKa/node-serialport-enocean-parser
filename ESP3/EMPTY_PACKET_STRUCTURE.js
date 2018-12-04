/*jslint node: true */
'use strict'

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

const ESP3_EMPTY_PACKET_STRUCTURE = {
  syncByte: 0x55,
  header: {
    dataLength: undefined,
    optionalLength: undefined,
    packetType: undefined
  },
  crc8Header: undefined,
  data: undefined,
  optionalData: undefined,
  crc8Data: undefined
};

module.exports = ESP3_EMPTY_PACKET_STRUCTURE
