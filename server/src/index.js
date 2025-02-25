const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const router = require("./routes");
const mongoose = require("mongoose");
const { Message } = require("./models/message.model");
const { User } = require("./models/user.model");
require('dotenv').config()

const frontendUrl = process.env.frontendUrl
const mongodbAtlasUri = process.env.mongodbAtlasUri

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: frontendUrl }));
app.use("/api", router);

const users = {};

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  console.log("users:", users);

  socket.on("join", (userId) => {
    users[userId] = socket.id;
    io.emit("onlineUsers", users);
    console.log(`${userId} joined with socket ID: ${socket.id}`);
  });

  socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
    const receiverSocketId = users[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", {
        senderId,
        receiverId,
        message,
      });
    }

    await Message.create({ senderId, receiverId, message });
    console.log(
      `recievde message from ${senderId} to ${receiverId} as ${message}`
    );
  });

  socket.on("updateLastSeen", async (userId) => {
    await User.findOneAndUpdate({ userId }, { lastSeen: new Date() });
  });

  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    for (let userId in users) {
      if (users[userId] === socket.id) {
        await User.findOneAndUpdate({ userId }, { lastSeen: new Date() });
        delete users[userId];
        io.emit("onlineUsers", users);
        break;
      }
    }
  });
});

mongoose
  .connect(mongodbAtlasUri)
  .then(() => {
    console.log("Database connected");
    server.listen(8000, () => console.log("Server running on port 8000"));
    console.log('client requests are coming from ', frontendUrl)
  })
  .catch((err) => console.log(err));

// export const config = { maxDuration: 30 };
// module.exports = app;
