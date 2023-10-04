const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const path = require("path");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.server = http.createServer(this.app);
    this.io = socketio(this.server, {});
  }

  middlewares() {
    // Desplegar el directorio público
    this.app.use(express.static(path.resolve(__dirname, "../public")));
    // Cors
    this.app.use(cors());
    // Body Parser
    this.app.use(express.json());
    this.app.use("/v1/auths", require("./router/auths"));
    this.app.use("/v1/properties", require("./router/properties"));
    this.app.use("/v1/users", require("./router/users"));
  }

  execute() {
    // Inicializar Middlewares
    this.middlewares();

    // Inicializar Server
    this.server.listen(this.port, () => {
      console.log("Server running on port:", this.port);
    });
  }
}

module.exports = Server;
