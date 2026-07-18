import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();


router.get(
    "/test",
    authMiddleware,
    authorizeRoles("admin"),
    (req, res) => {

        res.json({
            success:true,
            message:"Bienvenue dans la zone admin",
            user:req.user
        });

    }
);


export default router;