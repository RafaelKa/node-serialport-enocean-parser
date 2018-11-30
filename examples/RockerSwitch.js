const SerialPort = require('serialport')
const EnoceanParser = require('../ESP3Parser');

const port = new SerialPort('/dev/ttyUSB0',{ baudRate: 57600 })
const tcm310 = port.pipe(new EnoceanParser())

/*
 To use EnOcean Pi module you must disable serial console on /dev/ttyAMA0,
 you can do that with https://github.com/lurch/rpi-serial-console

 And /dev/ttyAMA0 must be readable from your user.
 add your user to dialout group or simple run "sudo chmod 777 /dev/ttyAMA0"

 */

tcm310.on('data', function(esp3Packet) {
  console.log(ESP3PacketFromRockerSwitch_PTMXXX(esp3Packet));
});

function ESP3PacketFromRockerSwitch_PTMXXX(esp3Packet) {

	var telegram = {
		"RORG": esp3Packet.data[0],
		"data": esp3Packet.data[1],
		"senderID": Buffer.from([esp3Packet.data[2], esp3Packet.data[3], esp3Packet.data[4], esp3Packet.data[5]]),
		"status": esp3Packet.data[6]
	};

	if (telegram.RORG !== 0xF6) {
		return "I don't understand " + telegram.RORG.toString(16) + " this telegram, i can show only Rocker Switch telegrams!";
	}

	// see RPS Telegram in "EnOcean Equipment Profiles (EEP)"
	var rockersFirstAction = (telegram.data >>> 5);          // 11100000 >> 5              | Shortcut : R1
	var energyBow = ((telegram.data >> 4) & 1) ;             // 00010000                   | Shortcut : EB  -> 0 = released or 1 = pressed
	var rockersSecondAction = ((telegram.data >> 1) & 0x07); // (00001110 >> 1) & 00000111 | Shortcut : R2
	var secondActionIsPresent = ((telegram.data) & 1);       // 00000001                   | Shortcut : EB

	// see Statusfield for RPS in "EnOcean Equipment Profiles (EEP)"
	var T21 = (telegram.status & 0x20) == 0x20;              // 00100000                   | 0 = PTM1xx or 1 = PTM2xx
	var NU = (telegram.status & 0x10) == 0x10;               // 00010000                   | 0 = unassigned or 1 = normal

	var buttonName = {
		0: "AI",
		1: "A0",
		2: "BI",
		3: "B0",
		4: "CI",
		5: "C0",
		6: "DI",
		7: "D0"
	};

	var energyBowDescription = {
		0: "on up", // released
		1: "on down" // pressed
	}

	var pushedButtons = "";

	if (NU == 1) {
		pushedButtons += buttonName[rockersFirstAction];
	} else {
		pushedButtons += "no";
	}
	if (secondActionIsPresent == 1) {
		pushedButtons += " & " + buttonName[rockersSecondAction];
	}

	var output = "{" + "\n" +
		"  Sender ID:  " + telegram.senderID.toString("hex") + "\n" +
		"  energy bow: " + energyBowDescription[energyBow] + "\n" +
		"  button[s]:  " + pushedButtons + "\n" +
		"}\n"
	;

	return output;

}
