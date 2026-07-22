import prisma from "../lib/prisma.js";

const TROPHY_POINTS = {
  facile: 10,
  moyen: 20,
  difficile: 35,
  insane: 50,
};

export const BADGE_DEFINITIONS = [
  { key: "first-ctf", label: "Premier CTF", color: "#FFD166", description: "Participer à un premier CTF" },
  { key: "mentor", label: "Mentor", color: "#2ED9A3", description: "Publier au moins 3 réponses" },
  { key: "web-hacker", label: "Web Hacker", color: "#FF4D5E", description: "Valider 2 réussites orientées web" },
  { key: "network", label: "Réseau", color: "#5B6EF5", description: "Valider 2 activités réseau" },
  { key: "top-10", label: "Top 10", color: "#FF9F43", description: "Entrer dans le Top 10 GowlSec" },
];

function scoreUser(user) {
  const trophyPoints = (user.trophies || []).reduce(
    (total, trophy) => total + (TROPHY_POINTS[trophy.difficulty] || 10),
    0
  );
  return trophyPoints + (user.questions?.length || 0) * 2 +
    (user.answers?.length || 0) * 3 + (user.labsOwned?.length || 0) * 5;
}

export async function getProfileBadgesAndPoints(userId, { persist = true } = {}) {
  const [user, ctfCount, answerCount, trophies, labs, rankingUsers, unlockedRows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        trophies: { select: { difficulty: true } },
        questions: { select: { id: true } },
        answers: { select: { id: true } },
        labsOwned: { select: { id: true } },
      },
    }),
    prisma.ctfRegistration.count({ where: { userId } }),
    prisma.answer.count({ where: { authorId: userId } }),
    prisma.trophy.findMany({ where: { authorId: userId }, select: { platform: true, title: true, note: true } }),
    prisma.lab.findMany({ where: { ownerId: userId }, select: { platform: true, title: true, description: true } }),
    prisma.user.findMany({
      select: {
        id: true,
        trophies: { select: { difficulty: true } },
        questions: { select: { id: true } },
        answers: { select: { id: true } },
        labsOwned: { select: { id: true } },
      },
    }),
    prisma.userBadge.findMany({ where: { userId } }),
  ]);

  if (!user) return { points: 0, rank: null, badges: [] };

  const points = scoreUser(user);
  const webSignals = trophies.filter((trophy) =>
    /web|portswigger|pentesterlab|xss|sql|api/i.test(`${trophy.platform} ${trophy.title} ${trophy.note}`)
  ).length;
  const networkSignals = [
    ...trophies.map((trophy) => `${trophy.platform} ${trophy.title} ${trophy.note}`),
    ...labs.map((lab) => `${lab.platform} ${lab.title} ${lab.description}`),
  ].filter((value) => /réseau|network|active directory|windows|linux|tcp|udp|dns|smb/i.test(value)).length;
  const ranking = rankingUsers
    .map((entry) => ({ id: entry.id, points: scoreUser(entry) }))
    .sort((a, b) => b.points - a.points || a.id - b.id);
  const rank = ranking.findIndex((entry) => entry.id === userId) + 1;

  const progressByKey = {
    "first-ctf": { unlocked: ctfCount >= 1, progress: `${Math.min(ctfCount, 1)}/1` },
    mentor: { unlocked: answerCount >= 3, progress: `${Math.min(answerCount, 3)}/3` },
    "web-hacker": { unlocked: webSignals >= 2, progress: `${Math.min(webSignals, 2)}/2` },
    network: { unlocked: networkSignals >= 2, progress: `${Math.min(networkSignals, 2)}/2` },
    "top-10": { unlocked: points > 0 && rank <= 10, progress: points > 0 ? `#${rank}` : "0 pt" },
  };

  const newlyUnlocked = BADGE_DEFINITIONS.filter(
    (definition) => progressByKey[definition.key]?.unlocked &&
      !unlockedRows.some((row) => row.key === definition.key)
  );

  if (persist && newlyUnlocked.length > 0) {
    await prisma.$transaction(
      newlyUnlocked.map((badge) => prisma.userBadge.upsert({
        where: { userId_key: { userId, key: badge.key } },
        update: {},
        create: { userId, key: badge.key },
      }))
    );
  }

  return {
    points,
    rank,
    badges: BADGE_DEFINITIONS.map((definition) => ({
      ...definition,
      ...progressByKey[definition.key],
      unlocked: progressByKey[definition.key].unlocked || unlockedRows.some((row) => row.key === definition.key),
    })),
  };
}
