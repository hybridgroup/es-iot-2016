var Cylon = require("cylon");

Cylon.robot({
  connections: {
    joystick: { adaptor: "joystick" },
    minidrone: { adaptor: "rolling-spider", uuid: process.env.ID},
    servidor: { adaptor: "mqtt", host: process.env.SERVIDOR }
  },
  devices: {
    controlador: { driver: "dualshock-3", connection: "joystick", description: "ShanWan PS(R) Ga`epad" },
    drone:  { driver: "rolling-spider", connection: "minidrone" }
  },
  work: function() {
    var mi = this,
        rightStick = { x: 0.0, y: 0.0 },
        leftStick = { x: 0.0, y: 0.0 },
        cmd = {};

    mi.controlador.on("triangle:press", function() {
      mi.drone.takeOff();
      mi.servidor.publish("drones/reparaciones", "despegue")
    });

    mi.controlador.on("x:press", function() {
      mi.drone.land();
      mi.servidor.publish("drones/reparaciones", "descenso")
    });

    mi.controlador.on("square:press", function() {
      mi.drone.hover();
    });

    mi.controlador.on("circle:press", function() {
      mi.drone.frontFlip();
    });

    mi.controlador.on("right_x:move", function(data) {
      rightStick.x = data;
    });

    mi.controlador.on("right_y:move", function(data) {
      rightStick.y = data;
    });

    mi.controlador.on("left_x:move", function(data) {
      leftStick.x = data;
    });

    mi.controlador.on("left_y:move", function(data) {
      leftStick.y = data;
    });

    setInterval(function() {
      var tilt = 0,
          forward = 0,
          turn = 0,
          up = 0,
          steps = 1;

      if (rightStick.y < 0) {
        forward = validatePitch(rightStick.y);
      } else if (rightStick.y > 0) {
        forward = validatePitch(rightStick.y) * -1;
      }

      if (rightStick.x > 0) {
        tilt = validatePitch(rightStick.x);
      } else if (rightStick.x < 0) {
        tilt = validatePitch(rightStick.x) * -1;
      }

      if (leftStick.y < 0) {
        up = validatePitch(leftStick.y);
      } else if (leftStick.y > 0) {
        up = validatePitch(leftStick.y) * -1;
      }

      if (leftStick.x > 0) {
        turn = validatePitch(leftStick.x);
      } else if (leftStick.x < 0) {
        turn = validatePitch(leftStick.x) * -1;
      }

      cmd.tilt = tilt;
      cmd.forward = forward;
      cmd.turn = turn;
      cmd.up = up;

      mi.drone.drive(cmd, steps);
    }, 0);
  }
}).start();

function validatePitch(data) {
  var value = Math.abs(data);
  if (value >= 0.1) {
    if (value <= 1.0) {
      return ((Math.round(value * 100.0) / 100.0) * 100) | 0;
    } else {
      return (1.0 * 100) | 0;
    }
  } else {
    return 0 ;
  }
}
