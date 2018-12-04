'use strict'

const ESP3Packet = require('../Packet')

class RADIO_ERP1 extends ESP3Packet {

  constructor(esp3Packet){
    super(esp3Packet)
  }

  get RORG() {
    return this.data[0]
  }

  get senderId() {
    return this.data.slice(this.data.length-5,this.data.length - 1)
  }

  get status() {
    return this.data[this.data.length - 1]
  }

  get subTelNum() {
    return this.optionalData[0]
  }

  get destinationID() {
    this.optionalData.slice(1, 5)
  }

  get dBm() {
    return this.optionalData[this.optionalData.length - 2]
  }

  get securityLevel() {
    this.optionalData[this.optionalData.length - 1]
  }
}

module.exports = RADIO_ERP1
