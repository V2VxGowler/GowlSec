import prisma from "../lib/prisma.js";


export const getMe = async (req, res) => {
  try {

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    });


    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable"
      });
    }


    res.json(user);


  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Erreur serveur"
    });

  }
};