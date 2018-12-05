const ESP3Packet = require('../ESP3Packet.js')

class CommonCommand extends ESP3Packet {
  constructor (esp3Packet) {
    super(esp3Packet)
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

module.exports = CommonCommand
