require('@babel/register');
import "core-js/stable";
import "regenerator-runtime/runtime";
import path from 'path';

import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

import User from "./controllers/User";
import SocketConnection from "./BusinessLogic/lib/SocketConnection";

const app = express();
let http = require("http").createServer(app);
let io = require("socket.io")(http);
global.SOCKET = new SocketConnection();
require('./BusinessLogic/Entrypoint');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "..", "ui")));
app.use(
  express.static(path.join(__dirname, "..", "..", "node_modules/socket.io"))
)

const user = new User(app);

app.get('/', (req, res) => {
  if (req.user)
    res.sendFile(path.join(__dirname, "..", "ui/dashboard.html"));
  else res.sendFile(path.join(__dirname, "..", "ui/login.html"));
});

app.post('/api/V1/login', (req, res) => {
  res.json(user.login(req, res));
});

app.get("/logout", (req, res) => {
  user.logout(req, res);
});


io.on("connection", (socket) => {
  SOCKET.init(socket);
});


http.listen(3000, () => {
  console.log("App is running on port:3000");
});
