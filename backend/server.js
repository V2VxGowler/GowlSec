import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.routes.js";
import { globalLimiter } from "./middleware/rateLimiter.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { verifyAccessToken } from "./utils/jwt.js";


dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    hidePoweredBy: true,
  })
);

const allowedOrigins = [
  "http://localhost:5173",
  "https://gowlsec.org",
  "https://www.gowlsec.org",
  "https://gowl-4g9awmpdp-gowl-sec.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origine CORS refusée : ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());


app.use("/api", globalLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);


// Route de test
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Backend GowlSec opérationnel 🚀"
    });
});


// Gestionnaire d'erreurs
app.use((err, req, res, next) => {

    console.error(err);

    res.status(500).json({
        success: false,
        message: "Erreur serveur"
    });

});


const PORT = process.env.PORT || 8080;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origine Socket.IO refusée : ${origin}`));
    },
    credentials: true,
  },
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

 
  if (!token) {
    socket.data.userId = null;
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);

    socket.data.userId =
      decoded.userId ??
      decoded.id ??
      decoded.sub ??
      null;

    next();
  } catch {
    socket.data.userId = null;
    next();
  }
});

const sendLiveCount = () => {
  io.emit("live-count", onlineUsers.size);
};

io.on("connection", (socket) => {
  const userId = socket.data.userId;

  if (userId) {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }

    onlineUsers.get(userId).add(socket.id);

    console.log(`Membre en ligne : ${userId}`);
  } else {
    console.log(`Visiteur non comptabilisé : ${socket.id}`);
  }

  sendLiveCount();

  socket.on("disconnect", () => {
    if (userId && onlineUsers.has(userId)) {
      const userSockets = onlineUsers.get(userId);

      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        onlineUsers.delete(userId);
        console.log(`Membre hors ligne : ${userId}`);
      }
    }

    sendLiveCount();
  });
});

httpServer.listen(PORT, () => {
  console.log(`GowlSec Socket.IO actif sur le port ${PORT}`);
  console.log(`Chemin Socket.IO : ${io.path()}`);
});
