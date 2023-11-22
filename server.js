const express = require("express");
const http = require("http");
const cors = require("cors");
const socketio = require("socket.io");
const path = require("path");
const { testDbConnection } = require("./db/database");
var formData = require("express-form-data");

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT;
    this.server = http.createServer(this.app);
    this.io = socketio(this.server, {});
  }

  async middlewares() {
    // Desplegar el directorio público
    this.app.use(express.static(path.resolve(__dirname, "../public")));
    // Cors
    this.app.use(cors());

    // Add headers before the routes are defined
    this.app.use(function (req, res, next) {

      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*');

      // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

      // Request headers you wish to allow
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization, authorization, Accept');

      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      //res.setHeader('Access-Control-Allow-Credentials', true);

      // Pass to next layer of middleware
      next();
    });


    // Body Parser
    this.app.use(express.json());
    this.app.use(formData.parse());
    this.app.use("/v1/auths", require("./router/auths"));
    this.app.use("/v1/authGoogle", require("./router/authGoogle"));
    this.app.use("/v1/properties", require("./router/properties"));
    this.app.use("/v1/users", require("./router/users"));
    this.app.use("/v1/contacts", require("./router/contacts"));
    this.app.use("/v1/contracts", require("./router/contracts"));
  }

  async execute() {

    await testDbConnection();

    // Inicializar Middlewares
    await this.middlewares();
    // Inicializar Server
    this.server.listen(this.port, () => {
      console.log("Server running on port:", this.port);
    });
  }
}

module.exports = Server;
