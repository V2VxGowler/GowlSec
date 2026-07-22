import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.routes.js";

import { globalLimiter } from "./middleware/rateLimiter.js";
import { verifyAccessToken } from "./utils/jwt.js";
import prisma from "./utils/prisma.js";

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

      return callback(
        new Error(`Origine CORS refusée : ${origin}`)
      );
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

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend GowlSec opérationnel 🚀",
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Erreur serveur",
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

      return callback(
        new Error(`Origine Socket.IO refusée : ${origin}`)
      );
    },
    credentials: true,
  },
});

const onlineUsers = new Map();

/*
 * Vérification du token envoyé par le frontend.
 */
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

    return next();
  } catch {
    socket.data.userId = null;
    return next();
  }
});

const sendLiveCount = () => {
  io.emit("live-count", onlineUsers.size);
};

io.on("connection", (socket) => {
  const userId = socket.data.userId;
  let lastMessageAt = 0;

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

  /*
   * Envoie les 100 derniers messages au frontend.
   */
  socket.on("hub-messages:load", async (callback) => {
    const reply =
      typeof callback === "function" ? callback : () => {};

    try {
      const messages = await prisma.hubMessage.findMany({
        take: 100,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });

      reply({
        success: true,
        messages: messages.reverse(),
      });
    } catch (error) {
      console.error(
        "Erreur pendant le chargement des messages :",
        error
      );

      reply({
        success: false,
        message: "Impossible de charger les messages.",
      });
    }
  });

  /*
   * Enregistre un nouveau message dans PostgreSQL.
   */
  socket.on("hub-message:send", async (payload, callback) => {
    const reply =
      typeof callback === "function" ? callback : () => {};

    const numericUserId = Number(userId);

    if (!Number.isInteger(numericUserId)) {
      return reply({
        success: false,
        message: "Connecte-toi pour envoyer un message.",
      });
    }

    const content =
      typeof payload?.content === "string"
        ? payload.content.trim()
        : "";

    if (!content) {
      return reply({
        success: false,
        message: "Le message est vide.",
      });
    }

    if (content.length > 1000) {
      return reply({
        success: false,
        message: "Le message ne peut pas dépasser 1000 caractères.",
      });
    }

    const now = Date.now();

    if (now - lastMessageAt < 1000) {
      return reply({
        success: false,
        message: "Tu envoies des messages trop rapidement.",
      });
    }

    lastMessageAt = now;

    try {
      const message = await prisma.hubMessage.create({
        data: {
          content,
          userId: numericUserId,
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              username: true,
              role: true,
            },
          },
        },
      });

      /*
       * Envoie le message à tous les membres connectés.
       */
      io.emit("hub-message:new", message);

      return reply({
        success: true,
        message,
      });
    } catch (error) {
      console.error(
        "Erreur pendant l’enregistrement du message :",
        error
      );

      return reply({
        success: false,
        message: "Impossible d’enregistrer le message.",
      });
    }
  });

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