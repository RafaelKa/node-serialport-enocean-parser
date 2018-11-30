const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser');
const transcoder = require("eep-transcoder")

const port = new SerialPort('/dev/ttyUSB0',{ baudRate: 57600 })
const tcm310 = port.pipe(new EnoceanParser())



tcm310.on('data', function(esp3Packet) {
  ESP3PacketFrom4BSSensor(esp3Packet)
});

function ESP3PacketFrom4BSSensor(esp3Packet) {
  var packetString=esp3Packet.getRawBuffer().toString("hex")
  var senderId=getSenderId(esp3Packet)

  var sensors={
    "ffd9b7e5":{
      eep:"a5-10-06",
      name:"Thermostat Büro"
    },
    "002a1d7e":{
      eep:"f6-02-03",
      name:"Switch"
    }
  }

  if(sensors.hasOwnProperty(senderId)){
    console.log(`Sensor ${senderId} is of type ${sensors[senderId].eep}. decoding data...`)
    console.log(transcoder.decode(packetString,sensors[senderId].eep).decoded)
    // Info on all fields conent and how to make sense of the data can be found at https://node-enocean.github.io/eep-spec/
  }else{
    console.log(`no eep info found for ${senderId}`)
    //console.log(transcoder.decode(packetString,"a5-10-06"))
  }

}

function getSenderId(esp3Packet){
 return esp3Packet.data.slice(esp3Packet.data.length-5,esp3Packet.data.length-1).toString("hex")
}
