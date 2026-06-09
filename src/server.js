require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const chatService = require("./services/chat.service");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allow all or specific frontend origin
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on("send_message", async (data) => {
    const { conversationId, senderId, content } = data;
    try {
      const message = await chatService.sendMessage(conversationId, senderId, content);
      io.to(conversationId).emit("receive_message", message);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});