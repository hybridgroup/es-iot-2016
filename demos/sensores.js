var Cylon = require("cylon");

Cylon.robot({
  connections: {
    placa: { adaptor: "intel-iot" },
    servidor: { adaptor: "mqtt", host: process.env.SERVIDOR }
  },
  devices: {
    termo: { driver: "temperature-sensor", pin: 0, connection: "placa" },
    luz: { driver: "analog-sensor", pin: 1, connection: "placa" },
    dial: { driver: "analog-sensor", pin: 2, connection: "placa" },
    pantalla: { driver: "jhd1313m1", connection: "placa" }
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
      var str = "dial: "+ val.toString();
      while (str.length < 16) {
        str = str + " ";
      }
      console.log(str);
      mi.pantalla.setCursor(0,0);
      mi.pantalla.write(str);
      mi.servidor.publish("sensores/dial", val.toString());
    });
  }
});

Cylon.start();
