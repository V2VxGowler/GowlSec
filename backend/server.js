import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/user.routes.js";
import { globalLimiter } from "./middleware/rateLimiter.js";


dotenv.config();

const app = express();

app.set("trust proxy", 1);


app.use(
    helmet({
        hidePoweredBy: true
    })
);


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://gowlsec-production.up.railway.app"
  ],
  credentials: true
}));


app.use(express.json());

app.use(cookieParser());


app.use(globalLimiter);


// Routes
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});