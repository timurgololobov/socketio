const socket = require("socket.io");
const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer((req, res) => {
  const indexPath = path.join(__dirname, "index.html");
  const readStream = fs.createReadStream(indexPath);
  readStream.pipe(res);
});
const io = socket(server);
const users = [];
const usersMap = {};
let clients = 0;

io.on("connection", (client) => {
  clients++;
  console.log("A user connected");
  usersMap[client.id] = {
    id: client.id,
  };
  client.on("setUsername", (data) => {
    console.log(data);
    if (users.indexOf(data) > -1) {
      client.emit(
        "userExists",
        data + " username is taken! Try some other username."
      );
    } else {
      users.push(data);
      client.emit("userSet", { username: data });
    }
  });

  client.on("msg", (data) => {
    io.sockets.emit("newmsg", data);
  });

  io.sockets.emit("broadcast", {
    description: clients + " клиентов",
  });

  client.on("disconnect", () => {
    clients--;
    io.sockets.emit("broadcast", {
      description: clients + " клиентов",
    });
    console.log("Disconnect");
    delete usersMap[client.id];
  });
  console.log(usersMap);
});

server.listen(5555);
