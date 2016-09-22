var Cylon = require("cylon");

Cylon.api("http", {
  ssl: false,
  port: 3000
});

Cylon.robot({
  connections: {
    placa: { adaptor: "firmata", port: "/dev/ttyACM0" },
    servidor: { adaptor: "mqtt", host: process.env.SERVIDOR }
  },
  devices: {
    leds: { driver: "rgb-led", redPin: 3, greenPin: 5, bluePin: 6, connection: "placa" },
    termo: { driver: "mqtt", topic: "sensores/termo", connection: "servidor" },
    luz: { driver: "mqtt", topic: "sensores/luz", connection: "servidor" },
    dial: { driver: "mqtt", topic: "sensores/dial", connection: "servidor" },
    drone: { driver: "mqtt", topic: "drones/reparaciones", connection: "servidor" }
  },

  estrellar: function() {
    var mi = this;
    mi.estrellando = true;
    mi.activado = false;
    mi.intermitente = setInterval(function(){
      if (mi.activado) {
        mi.leds.setRGB("ff00ff");
        mi.activado = false;
      } else {
        mi.leds.setRGB("0000ff");
        mi.activado = true;
      }
    }, 500);
  },

  work: function(mi) {
    mi.leds.setRGB("0000ff");

    mi.termo.on("message", function(val) {
      console.log("termo:", val.toString());
    });

    mi.luz.on("message", function(val) {
      console.log("luz:", val.toString());
    });

    mi.dial.on("message", function(val) {
      var fuerza = parseInt(val.toString());
      console.log("dial:", fuerza);
      if (mi.estrellando) return;
      if (fuerza < 100) {
        mi.leds.setRGB("ff0000");
      } else if (fuerza < 500) {
        mi.leds.setRGB("ffff00");
      } else {
        mi.leds.setRGB("00ff00");
      }
    });

    mi.drone.on("message", function(val) {
      var estado = val.toString();
      console.log("drone:", estado);
      if (estado == "despegue") {
        mi.estrellar();
      } else if (estado == "descenso") {
        mi.estrellando = false;
        clearInterval(mi.intermitente);
      } else {
        console.log("nada");
      }
    });
  }
});

Cylon.start();
