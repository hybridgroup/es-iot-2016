var Cylon = require("cylon");

Cylon.robot({
  connections: {
    placa: { adaptor: "intel-iot" },
    servidor: { adaptor: "mqtt", host: process.env.SERVIDOR }
  },
  devices: {
    termo: { driver: "temperature-sensor", pin: 0, connection: "placa" },
    luz: { driver: "analog-sensor", pin: 1, connection: "placa" },
    dial: { driver: "analog-sensor", pin: 2, connection: "placa" }
  },

  work: function(mi) {
    every(100, function() {
      var val = mi.termo.celsius();
      console.log("termometro valor:", val);
      mi.servidor.publish("sensores/termo", val.toString());
    });

    mi.luz.on("analogRead", function(val) {
      console.log("luz valor:", val);
      mi.servidor.publish("sensores/luz", val.toString());
    });

    mi.dial.on("analogRead", function(val) {
      console.log("dial valor:", val);
      mi.servidor.publish("sensores/dial", val.toString());
    });
  }
});

Cylon.start();
