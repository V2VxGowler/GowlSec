import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Shield, Trophy, MessageSquare, Lock, Send, Plus, X,
  ChevronDown, ChevronUp, Trash2, Unlock, RefreshCw, CheckCircle2,
  AlertTriangle, Flag, Award, Activity, Mail, LogOut, Newspaper,
  ExternalLink, Gauge, Bot, Sparkles, Pin, Ghost, Skull, Bug, Cat,
  Eye, EyeOff, Loader2, Lightbulb, FlaskConical, Wrench, BookOpen, Target,
  Rabbit, Cpu, Flame, Bird, Hash, Megaphone, User as UserIcon, Pencil,
  ShoppingCart, CreditCard, Users, Clock, Wifi, Circle,
  MessageCircle, Globe, KeyRound, Zap, TrendingUp, Radio,
  Crown, Search, Calendar, Compass, FileText, MapPin,
} from "lucide-react";


/* lucide-react 1.0 a retiré les icônes de marques (Twitter, GitHub, etc.) — icône maison de remplacement */
function XIcon({ size = 16, style, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <path d="M4 4l16 16M20 4L4 20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
import ProtectedTab from "./components/ProtectedTab";
import { useAuth } from "./context/AuthContext";
import Register from "./pages/Register";
import { login, saveSession } from "./api/auth";

function GitHubIcon({ size = 16, style, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
      <path d="M12 2C6.48 2 2 6.58 2 12.21c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.11-1.52-1.11-1.52-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.21C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

const SEED_NEWS = [
  {
    id: 1,
    title: "GowlSec est en ligne",
    summary: "La plateforme communautaire de cybersécurité GowlSec ouvre officiellement ses portes.",
    category: "update",
    source: "Équipe GowlSec",
    date: new Date().toISOString()
  },
  {
    id: 2,
    title: "Bienvenue à toute la communauté",
    summary: "Forum, labs, teams, classement, trophées et bien plus : explore les salons pour progresser ensemble.",
    category: "announcement",
    source: "Équipe GowlSec",
    date: new Date().toISOString()
  }
];

const C = {
  bg: "#0A0C10",
  panel: "#12151B",
  panel2: "#171B22",
  line: "#242A34",
  text: "#EDEFF2",
  muted: "#8A93A3",
  primary: "#5B6EF5",
  alert: "#FF4D5E",
  warn: "#FF9F43",
  ok: "#2ED9A3",
  gold: "#FFD166",
  discord: "#5865F2",
};

const DISPLAY_FONT = "'Sora', sans-serif";
const BODY_FONT = "'Source Sans 3', sans-serif";
const MONO_FONT = "'IBM Plex Mono', monospace";

/* ---------------------------------------------------------------------
   Fond animé — réseau de nœuds qui dérivent et se relient, dans l'esprit
   "carte réseau / graphe d'infra" de la communauté. Canvas plein écran,
   fixé derrière tout le contenu, non interactif, respecte prefers-reduced-motion.
--------------------------------------------------------------------- */
function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const palette = [C.primary, C.ok, C.gold];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes = [];
    let raf = null;

    function resize() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(22, Math.min(64, Math.round((width * height) / 28000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.3 + 0.6,
        c: palette[Math.floor(Math.random() * palette.length)],
      }));
    }

    function draw(animate) {
      ctx.clearRect(0, 0, width, height);
      if (animate) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < -24) n.x = width + 24;
          if (n.x > width + 24) n.x = -24;
          if (n.y < -24) n.y = height + 24;
          if (n.y > height + 24) n.y = -24;
        }
      }
      const linkDist = Math.min(150, Math.max(90, width / 7));
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            const op = Math.round((1 - dist / linkDist) * 40)
              .toString(16)
              .padStart(2, "0");
            ctx.strokeStyle = `${C.primary}${op}`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `${n.c}66`;
        ctx.fill();
      }
    }

    function loop() {
      draw(true);
      raf = requestAnimationFrame(loop);
    }

    resize();
    if (reduceMotion) {
      draw(false);
    } else {
      raf = requestAnimationFrame(loop);
    }

    function onResize() {
      resize();
      draw(false);
    }
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="gowl-bg-network" />;
}

const QUESTION_TYPES = [
  { key: "urgent", label: "Urgent avant examen", color: C.alert },
  { key: "accompagnement", label: "Besoin d'accompagnement", color: C.warn },
  { key: "blocage", label: "Blocage technique", color: C.primary },
  { key: "question", label: "Question rapide", color: C.ok },
];

const DIFFICULTIES = [
  { key: "facile", label: "Facile", color: C.ok },
  { key: "moyen", label: "Moyen", color: C.primary },
  { key: "difficile", label: "Difficile", color: C.warn },
  { key: "insane", label: "Insane", color: C.alert },
];

const NEWS_CATEGORIES = [
  { key: "update", label: "Mise à jour", color: C.primary, icon: RefreshCw },
  { key: "announcement", label: "Annonce", color: C.gold, icon: Megaphone },
  { key: "congrats", label: "Félicitations", color: C.ok, icon: Award },
  { key: "event", label: "Événement", color: C.alert, icon: Calendar },
];

const PLATFORMS = [
  "TryHackMe",
  "Root-Me",
  "Hack The Box",
  "Offsec",
  "PentesterLab",
  "PortSwigger",
  "CyberDefenders",
  "CTFTime",
  "Autre",
];

const LAB_PLATFORMS = [
  { key: "htb", label: "Hack The Box" },
  { key: "thm", label: "TryHackMe" },
  { key: "rootme", label: "Root-Me" },
  { key: "autre", label: "Autre" },
];

const TEAM_MAX_MEMBERS = 16;
const LAB_MAX_MEMBERS = 8;

const DEFAULT_ROOMS = [
  { key: "general", label: "Général", desc: "Discussion libre de la communauté", isPublic: true },
];

const AVATAR_OPTIONS = [
  { key: "bird", icon: Bird, color: "#1F2937" },
  { key: "ghost", icon: Ghost, color: "#5B6EF5" },
  { key: "skull", icon: Skull, color: "#FF4D5E" },
  { key: "bug", icon: Bug, color: "#2ED9A3" },
  { key: "cat", icon: Cat, color: "#FF9F43" },
  { key: "cpu", icon: Cpu, color: "#58A6FF" },
  { key: "rabbit", icon: Rabbit, color: "#F477B7" },
  { key: "flame", icon: Flame, color: "#FFD166" },
];
const AVATAR_MAP = Object.fromEntries(AVATAR_OPTIONS.map((a) => [a.key, a]));

const BANNER_OPTIONS = [
  { key: "indigo", css: "linear-gradient(135deg,#5B6EF5,#1F2A6B)" },
  { key: "crimson", css: "linear-gradient(135deg,#FF4D5E,#4A0E17)" },
  { key: "forest", css: "linear-gradient(135deg,#2ED9A3,#0B3B2E)" },
  { key: "sunset", css: "linear-gradient(135deg,#FF9F43,#5C2400)" },
  { key: "night", css: "linear-gradient(135deg,#3A4256,#05060A)" },
];
const BANNER_MAP = Object.fromEntries(BANNER_OPTIONS.map((b) => [b.key, b.css]));

const TEAM_EMOJIS = ["🛡️", "🦉", "🐺", "🦅", "🐉", "🔥", "⚡", "🎯", "💀", "🧠", "🕸️", "🐍", "👾", "🔐", "🚀", "🎮"];

const SHOP_PRODUCTS = [
  {
    id: "Vip-cyber", icon: Crown,
    title: "Pack VIP",
    tagline: "Rejoignez l'espace VIP de la communauté et profitez d'avantages exclusifs réservés aux membres..",
    features: [
      "Accès au salon de discussion privé réservé aux membres VIP",
      "Badge VIP exclusif affiché sur votre profil",
      "Photo de profil animée",
      "Bannière de profil personnalisée",
      "Pack d'émojis et gif exclusifs utilisables sur le site",
      "Icône VIP exclusive",
    ],
    format: "Icône de membre fondateur, disponible uniquement durant la première année",
    price: 9.99 ,
 },
  {
    id: "init-cyber", icon: Shield,
    title: "Initiation Cybersécurité",
    tagline: "Pack Découverte.",
    features: [
      "Vocabulaire et fondamentaux du hacking éthique",
      "Les bases de la cybersécurité",
      "Maîtrisez Linux",
      "Installation et prise en main d'un environnement Parrot OS ou Kali Linux en dual boot.",
      "Accès au salon Discord dédié aux membres",

      
    ],
    format: "Les coachings se déroulent à distance via Discord, TeamSpeak ou Telegram, avec partage d'écran si nécessaire pour un accompagnement pratique et interactif. Durée : 1 semaine – créneaux à définir ensemble selon vos disponibilités.",
    price: 29.99,
  },
  
];

const EVENT_TYPES = [
  { key: "ctf", label: "CTF", color: C.alert },
  { key: "coaching", label: "Coaching boutique", color: C.gold },
  { key: "discord", label: "Live Discord", color: C.discord },
  { key: "autre", label: "Autre", color: C.primary },
];

const LEARNING_PATHS = [
  {
    key: "reseaux", title: "Semaine 1 — Réseaux", accent: C.primary,
    desc: "Les bases indispensables avant tout pentest : modèle OSI, TCP/IP, ports et services.",
    steps: [
      { id: "r1", label: "Consulter les prochains événements réseau", tab: "evenements" },
      { id: "r2", label: "Poser une question sur un blocage réseau", tab: "forum" },
      { id: "r3", label: "Rejoindre un salon lab orienté réseau", tab: "labs" },
      { id: "r4", label: "Ajouter un premier trophée réseau", tab: "trophies" },
    ],
  },
  {
    key: "web", title: "Semaine 2 — Web", accent: C.ok,
    desc: "Attaques côté web : injections, authentification, logique métier.",
    steps: [
      { id: "w1", label: "Rejoindre un salon lab web (HTB/Root-Me)", tab: "labs" },
      { id: "w2", label: "Échanger sur le Hub autour d'un CTF web", tab: "salons" },
      { id: "w3", label: "Publier un write-up sur un challenge web résolu", tab: "writeups" },
      { id: "w4", label: "Ajouter le trophée correspondant", tab: "trophies" },
    ],
  },
  {
    key: "team", title: "Semaine 3 — Travailler en équipe", accent: C.warn,
    desc: "Passer du solo au collectif : team, salons labs partagés, entraide.",
    steps: [
      { id: "t1", label: "Créer ou rejoindre une team", tab: "equipes" },
      { id: "t2", label: "Ouvrir un salon lab en équipe", tab: "labs" },
      { id: "t3", label: "S'inscrire à un événement (CTF ou live)", tab: "evenements" },
      { id: "t4", label: "Consulter le classement pour se situer", tab: "classement" },
    ],
  },
  {
    key: "certif", title: "Semaine 4 — Vers la certification", accent: C.gold,
    desc: "Consolider avant de viser une certification (eJPT, OSCP...).",
    steps: [
      { id: "c1", label: "Suivre un coaching de la boutique", tab: "boutique" },
      { id: "c2", label: "Relire les write-ups de la communauté", tab: "writeups" },
      { id: "c3", label: "Ajouter sa certification en trophée", tab: "trophies" },
      { id: "c4", label: "Vérifier son niveau/XP sur son profil", tab: "profil" },
    ],
  },
];

const SUPPORT_CATEGORIES = [
  { key: "question", label: "Question", color: C.primary, icon: MessageCircle },
  { key: "boutique", label: "Boutique", color: C.gold, icon: ShoppingCart },
  { key: "probleme", label: "Problème technique", color: C.alert, icon: AlertTriangle },
  { key: "autre", label: "Autre", color: C.ok, icon: Mail },
];

const SUPPORT_STATUS = {
  open: { label: "Ouvert", color: C.warn },
  in_progress: { label: "En cours", color: C.primary },
  resolved: { label: "Résolu", color: C.ok },
};

const SUPPORT_FAQ = [
  { q: "Comment rejoindre une team ou un salon lab ?", a: "Rends-toi dans l'onglet Team ou Labs, puis clique sur « Rejoindre » sur la carte de ton choix. Certains salons sont privés et nécessitent une invitation du créateur." },
  { q: "J'ai un souci avec ma commande boutique", a: "Choisis la catégorie « Boutique » ci-dessous et indique ton numéro de commande si tu l'as : ça accélère grandement le traitement." },
  { q: "Comment gagner des points de classement ?", a: "Les points s'obtiennent en validant des labs, en répondant aux questions du forum et en participant aux événements listés dans l'onglet Événements." },
  { q: "Je n'arrive pas à me connecter", a: "Vérifie ton adresse e-mail et ton mot de passe, ou utilise « Mot de passe oublié » sur la fenêtre de connexion. Si le souci persiste, ouvre un ticket en catégorie « Problème technique »." },
];

// Le statut admin doit être déterminé par le backend (ex: profile.role === "admin"),
// jamais par un e-mail ou un mot de passe codé en dur dans le bundle JS client :
// n'importe qui peut l'extraire depuis l'inspecteur du navigateur.

const ONLINE_WINDOW_MS = 2 * 60 * 1000;

/* ---------------------------------------------------------------------
   Internationalisation — sélection de langue à l'entrée du site
--------------------------------------------------------------------- */
const LANGUAGES = [
  { key: "fr", label: "Français", short: "FR",  },
  { key: "en", label: "English", short: "EN",  },
  { key: "ru", label: "Русский", short: "RU",  },
  { key: "zh", label: "中文", short: "中文",  },
];



const I18N = {
  fr: {
    chooseLangTitle: "Choisis ta langue",
    chooseLangSub: "La communauté GowlSec parle plusieurs langues — sélectionne la tienne pour continuer.",
    chooseLangCta: "Continuer",
    tagline: "",
    tabs: { accueil: "Accueil", actus: "Actualités", forum: "Question", salons: "Hub", equipes: "Team", labs: "Labs", classement: "Classement", trophies: "Trophées", writeups: "Write-ups", evenements: "Événements", parcours: "Parcours", boutique: "Boutique", assistant: "Assistant IA", support: "Support" },
    live: "en ligne", admin: "Admin",
    heroTitle1: "Communauté francophone ", heroTitle2: "pentest, CTF, réseau et cybersécurité",
    heroSub: "Ici, on apprend, on échange et on progresse ensemble autour du pentest, des CTF, du réseau et de la cybersécurité — que tu sois débutant ou confirmé.",
    membersJoined: "membres inscrits", joinFirst: "Rejoins les tout premiers membres", peerHelp: "entraide entre pairs, pas de cours magistral",
    ctaAsk: "Poser une question", ctaHub: "Rejoindre le Hub",
    quickStartTitle: "Démarrage rapide", quickStartSubtitle: "Trois actions simples pour entrer dans la communauté et avancer plus vite.",
    quickStartForumTitle: "Poser une question", quickStartForumDesc: "Partage ton blocage et fais remonter ton besoin en quelques secondes.",
    quickStartHubTitle: "Rejoindre le Hub", quickStartHubDesc: "Échange en direct sur un sujet précis avec l’écosystème GowlSec.",
    quickStartTeamTitle: "Créer une team", quickStartTeamDesc: "Forme une escouade pour un CTF, un lab ou une préparation d’examen.",
    statNews: "actus", statQuestions: "questions", statTrophies: "trophées", statTeams: "teams", statLabs: "labs",
    activityTitle: "Ça bouge en ce moment", activityEmpty: "La communauté démarre — sois le premier à agir.",
    scanLabel: "corbeau en fouille dans la base de données", watchAll: "Voir toutes les actualités",
    trending: "Ça circule en ce moment", live2: "EN DIRECT", watching: "veille active",
    footer: "GowlSec — communauté pentest & CTF · à but pédagogique",
    forumTitle: "Question", forumSub: "Pose une question ou demande un accompagnement.",
    forumHeroEyebrow: "Nouvelle question", forumHeroTitle: "Débloque-toi en quelques minutes",
    forumHeroSub: "Décris ton contexte et ce que tu as déjà essayé : la communauté et les mentors répondent en direct, pas de question trop bête.",
    newQuestion: "Nouvelle question", cancel: "Annuler", publish: "Publier",
    hubTitle: "Hub", hubSub: "Entraide en direct, par thème.",
    hubHeroEyebrow: "Le Hub", hubHeroTitle: "Discute en direct, par thème",
    hubHeroSub: "Choisis un salon pour rejoindre la conversation en cours — chacun a sa propre ambiance et son propre sujet.",
    teamTitle: "Team", teamSub: "Crée ta team (16 membres max), publique ou privée, recrute, publiez vos annonces.",
    teamHeroEyebrow: "Nouvelle team", teamHeroTitle: "Monte ton escouade de hackers",
    teamHeroSub: "Choisis un nom, un logo, jusqu'à 16 membres. Publique pour recruter en ouvert, privée pour rester entre vous.",
    newTeam: "Créer une équipe",
    labsTitle: "Labs", labsSub: "Crée ou rejoins un salon pour avancer ensemble sur un lab HTB, TryHackMe, Root-Me... (8 personnes max)",
    labsHeroEyebrow: "Nouveau salon lab", labsHeroTitle: "Ouvre une session de lab protégée",
    labsHeroSub: "Réunis jusqu'à 8 personnes autour d'un même lab HTB, TryHackMe ou Root-Me, avec son propre fil de discussion.",
    newLab: "Créer un lab",
    cardForumDesc: "Pose une question sur ton pentest.", cardHubDesc: "Discute en direct par thème avec la communauté.",
    cardTeamDesc: "Crée ou rejoins une team (16 max), publique ou privée.", cardLabsDesc: "Rejoins un salon pour avancer à plusieurs sur un lab (8 max).",
    cardClassementDesc: "Qui cumule le plus de points sur GowlSec.", cardBoutiqueDesc: "Des formations pour bien démarrer, dès 29€.", cardAssistantDesc: "Un coup de main immédiat en cas de blocage.",
  },
  en: {
    chooseLangTitle: "Choose your language",
    chooseLangSub: "The GowlSec community speaks several languages — pick yours to continue.",
    chooseLangCta: "Continue",
    tagline: "",
    tabs: { accueil: "Home", actus: "News", forum: "Question", salons: "Hub", equipes: "Team", labs: "Labs", classement: "Leaderboard", trophies: "Trophies", boutique: "Shop", assistant: "AI Assistant", support: "Support", admin: "Admin" },
    live: "online", admin: "Admin",
    heroTitle1: "The pentest & CTF community ", heroTitle2: "that never sleeps",
    heroSub: "Here, you don't learn alone. Ask a question at 2am, find a team for a CTF, tackle a lab together, or get unblocked live on the Hub — the community answers.",
    membersJoined: "registered members", joinFirst: "Join the very first members", peerHelp: "peer-to-peer help, not a lecture",
    ctaAsk: "Ask a question", ctaHub: "Join the Hub",
    quickStartTitle: "Quick start", quickStartSubtitle: "Three simple actions to jump into the community and move faster.",
    quickStartForumTitle: "Ask a question", quickStartForumDesc: "Share your blocker and surface your need in a few seconds.",
    quickStartHubTitle: "Join the Hub", quickStartHubDesc: "Talk live about a specific topic with the GowlSec ecosystem.",
    quickStartTeamTitle: "Create a team", quickStartTeamDesc: "Form a squad for a CTF, a lab, or exam prep.",
    statNews: "news", statQuestions: "questions", statTrophies: "trophies", statTeams: "teams", statLabs: "labs",
    activityTitle: "Happening right now", activityEmpty: "The community is just getting started — be the first to act.",
    scanLabel: "crow scanning the database", watchAll: "See all news",
    trending: "Trending now", live2: "LIVE", watching: "active watch",
    footer: "GowlSec — pentest & CTF community · for learning purposes",
    forumTitle: "Question", forumSub: "Ask a question or request guidance.",
    forumHeroEyebrow: "New question", forumHeroTitle: "Get unblocked in minutes",
    forumHeroSub: "Describe your context and what you've already tried: the community and mentors answer live — no question is too silly.",
    newQuestion: "New question", cancel: "Cancel", publish: "Publish",
    hubTitle: "Hub", hubSub: "Live peer support, by topic.",
    hubHeroEyebrow: "The Hub", hubHeroTitle: "Chat live, by topic",
    hubHeroSub: "Pick a room to join the ongoing conversation — each one has its own vibe and subject.",
    teamTitle: "Team", teamSub: "Create your team (16 members max), public or private, recruit, post announcements.",
    teamHeroEyebrow: "New team", teamHeroTitle: "Build your hacker squad",
    teamHeroSub: "Pick a name, a logo, up to 16 members. Public to recruit openly, private to stay just among you.",
    newTeam: "Create a team",
    labsTitle: "Labs", labsSub: "Create or join a room to work together on an HTB, TryHackMe, Root-Me lab... (8 people max)",
    labsHeroEyebrow: "New lab room", labsHeroTitle: "Open a protected lab session",
    labsHeroSub: "Bring together up to 8 people around the same HTB, TryHackMe or Root-Me lab, with its own discussion thread.",
    newLab: "Create a lab",
    cardForumDesc: "Ask a question about your pentest.", cardHubDesc: "Chat live by topic with the community.",
    cardTeamDesc: "Create or join a team (16 max), public or private.", cardLabsDesc: "Join a room to progress together on a lab (8 max).",
    cardClassementDesc: "Who's stacking the most points on GowlSec.", cardBoutiqueDesc: "Courses to get you started, from €29.", cardAssistantDesc: "Instant help whenever you're stuck.",
  },
  ru: {
    chooseLangTitle: "Выберите язык",
    chooseLangSub: "Сообщество GowlSec говорит на нескольких языках — выберите свой, чтобы продолжить.",
    chooseLangCta: "Продолжить",
    tagline: "",
    tabs: { accueil: "Главная", actus: "Новости", forum: "Вопрос", salons: "Хаб", equipes: "Команда", labs: "Лабы", classement: "Рейтинг", trophies: "Трофеи", boutique: "Магазин", assistant: "ИИ-ассистент", support: "Поддержка", admin: "Админ" },
    live: "онлайн", admin: "Админ",
    heroTitle1: "Сообщество пентеста и CTF, ", heroTitle2: "которое никогда не спит",
    heroSub: "Здесь никто не учится в одиночку. Задай вопрос в 2 часа ночи, найди команду для CTF, проходите лабу вместе или получи помощь в прямом эфире на Хабе — сообщество ответит.",
    membersJoined: "зарегистрированных участников", joinFirst: "Присоединяйся к первым участникам", peerHelp: "взаимопомощь, а не лекция",
    ctaAsk: "Задать вопрос", ctaHub: "Перейти в Хаб",
    quickStartTitle: "Быстрый старт", quickStartSubtitle: "Три простых шага, чтобы быстрее войти в сообщество и двигаться вперёд.",
    quickStartForumTitle: "Задать вопрос", quickStartForumDesc: "Поделись своей проблемой и задай вопрос за несколько секунд.",
    quickStartHubTitle: "Войти в Хаб", quickStartHubDesc: "Общайся в прямом эфире по конкретной теме с экосистемой GowlSec.",
    quickStartTeamTitle: "Создать команду", quickStartTeamDesc: "Собери отряд для CTF, лабы или подготовки к экзамену.",
    statNews: "новости", statQuestions: "вопросы", statTrophies: "трофеи", statTeams: "команды", statLabs: "лабы",
    activityTitle: "Происходит прямо сейчас", activityEmpty: "Сообщество только начинается — стань первым.",
    scanLabel: "ворон ищет в базе данных", watchAll: "Все новости",
    trending: "Сейчас обсуждают", live2: "ПРЯМОЙ ЭФИР", watching: "активное наблюдение",
    footer: "GowlSec — сообщество пентеста и CTF · в учебных целях",
    forumTitle: "Вопрос", forumSub: "Задай вопрос или попроси помощи.",
    forumHeroEyebrow: "Новый вопрос", forumHeroTitle: "Получи помощь за пару минут",
    forumHeroSub: "Опиши контекст и что ты уже пробовал: сообщество и наставники отвечают в прямом эфире — глупых вопросов не бывает.",
    newQuestion: "Новый вопрос", cancel: "Отмена", publish: "Опубликовать",
    hubTitle: "Хаб", hubSub: "Живое общение по темам.",
    hubHeroEyebrow: "Хаб", hubHeroTitle: "Общайся в прямом эфире по темам",
    hubHeroSub: "Выбери комнату, чтобы присоединиться к разговору — у каждой своя атмосфера и своя тема.",
    teamTitle: "Команда", teamSub: "Создай команду (макс. 16 участников), публичную или приватную, набирай людей, публикуй объявления.",
    teamHeroEyebrow: "Новая команда", teamHeroTitle: "Собери свой отряд хакеров",
    teamHeroSub: "Выбери название, логотип, до 16 участников. Публичная — для открытого набора, приватная — только для своих.",
    newTeam: "Создать команду",
    labsTitle: "Лабы", labsSub: "Создай или присоединись к комнате, чтобы вместе проходить лабу HTB, TryHackMe, Root-Me... (макс. 8 человек)",
    labsHeroEyebrow: "Новая лаб-комната", labsHeroTitle: "Открой защищённую сессию лабы",
    labsHeroSub: "Собери до 8 человек вокруг одной лабы HTB, TryHackMe или Root-Me, со своим отдельным чатом.",
    newLab: "Создать лаб",
    cardForumDesc: "Задай вопрос по своему пентесту.", cardHubDesc: "Общайся в прямом эфире по темам с сообществом.",
    cardTeamDesc: "Создай или вступи в команду (макс. 16), публичную или приватную.", cardLabsDesc: "Присоединись к комнате, чтобы вместе проходить лабу (макс. 8).",
    cardClassementDesc: "Кто набирает больше всего очков на GowlSec.", cardBoutiqueDesc: "Курсы для старта — от 29€.", cardAssistantDesc: "Мгновенная помощь, когда ты застрял.",
  },
  zh: {
    chooseLangTitle: "选择你的语言",
    chooseLangSub: "GowlSec 社区使用多种语言 — 请选择你的语言以继续。",
    chooseLangCta: "继续",
    tagline: "",
    tabs: { accueil: "首页", actus: "资讯", forum: "提问", salons: "社区中心", equipes: "战队", labs: "实验室", classement: "排行榜", trophies: "奖杯", boutique: "商店", assistant: "AI 助手", support: "支持", admin: "管理" },
    live: "在线", admin: "管理",
    heroTitle1: "永不打烊的 ", heroTitle2: "渗透测试与 CTF 社区",
    heroSub: "在这里，你不是一个人学习。凌晨两点提问、组队参加 CTF、和大家一起攻克实验室，或在社区中心实时获得帮助——社区会回应你。",
    membersJoined: "位注册成员", joinFirst: "加入最早的一批成员", peerHelp: "同伴互助，而非单向授课",
    ctaAsk: "提出问题", ctaHub: "加入社区中心",
    quickStartTitle: "快速开始", quickStartSubtitle: "三个简单动作，帮助你更快融入社区并推进进度。",
    quickStartForumTitle: "提出问题", quickStartForumDesc: "用几秒钟分享你的阻塞点并发出请求。",
    quickStartHubTitle: "加入社区中心", quickStartHubDesc: "围绕特定主题与 GowlSec 生态实时交流。",
    quickStartTeamTitle: "创建战队", quickStartTeamDesc: "为 CTF、实验室或备考组建一支小队。",
    statNews: "资讯", statQuestions: "问题", statTrophies: "奖杯", statTeams: "战队", statLabs: "实验室",
    activityTitle: "实时动态", activityEmpty: "社区刚刚起步 — 快来成为第一个行动的人。",
    scanLabel: "乌鸦正在搜索数据库", watchAll: "查看全部资讯",
    trending: "近期热议", live2: "直播中", watching: "持续监控",
    footer: "GowlSec — 渗透测试与 CTF 社区 · 仅供学习交流",
    forumTitle: "提问", forumSub: "提出问题或请求指导。",
    forumHeroEyebrow: "新的提问", forumHeroTitle: "几分钟内获得帮助",
    forumHeroSub: "描述你的背景和已经尝试过的方法：社区成员和导师会实时回复 — 没有问题是愚蠢的。",
    newQuestion: "新的提问", cancel: "取消", publish: "发布",
    hubTitle: "社区中心", hubSub: "按主题实时互助交流。",
    hubHeroEyebrow: "社区中心", hubHeroTitle: "按主题实时聊天",
    hubHeroSub: "选择一个房间加入正在进行的对话 — 每个房间都有自己的氛围和主题。",
    teamTitle: "战队", teamSub: "创建你的战队（最多16人），公开或私密，招募成员，发布公告。",
    teamHeroEyebrow: "新建战队", teamHeroTitle: "组建你的黑客小队",
    teamHeroSub: "选择名称、队徽，最多16名成员。公开招募或私密仅限内部。",
    newTeam: "创建战队",
    labsTitle: "实验室", labsSub: "创建或加入房间，一起攻克 HTB、TryHackMe、Root-Me 的实验室...（最多8人）",
    labsHeroEyebrow: "新建实验室房间", labsHeroTitle: "开启一个受保护的实验室会话",
    labsHeroSub: "召集最多8人围绕同一个 HTB、TryHackMe 或 Root-Me 实验室，拥有专属讨论区。",
    newLab: "创建实验室",
    cardForumDesc: "就你的渗透测试提出问题。", cardHubDesc: "按主题与社区实时聊天。",
    cardTeamDesc: "创建或加入战队（最多16人），公开或私密。", cardLabsDesc: "加入房间，与他人一起攻克实验室（最多8人）。",
    cardClassementDesc: "看看谁在 GowlSec 上积累了最多积分。", cardBoutiqueDesc: "从 29€ 起的入门课程。", cardAssistantDesc: "遇到困难时立即获得帮助。",
  },
};
function t(lang, key) {
  const dict = I18N[lang] || I18N.fr;
  return dict[key] ?? I18N.fr[key] ?? key;
}

function shadeColor(hex, percent) {
  try {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) + Math.round(2.55 * percent);
    let g = ((num >> 8) & 0x00ff) + Math.round(2.55 * percent);
    let b = (num & 0x0000ff) + Math.round(2.55 * percent);
    r = Math.min(255, Math.max(0, r)); g = Math.min(255, Math.max(0, g)); b = Math.min(255, Math.max(0, b));
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
  } catch { return hex; }
}
function uid() {
  return (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`);
}
function timeAgo(iso) {
  const d = new Date(iso);
  const diff = Math.max(0, Date.now() - d.getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 30) return `il y a ${j} j`;
  return new Date(iso).toLocaleDateString("fr-FR");
}
function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}
async function hashText(text, salt = "") {
  try {
    const enc = new TextEncoder().encode(text);
    const saltEnc = new TextEncoder().encode(salt || "gowlsec-default-salt");
    const keyMaterial = await crypto.subtle.importKey("raw", enc, "PBKDF2", false, ["deriveBits"]);
    const derived = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltEnc, iterations: 200000 }, keyMaterial, 256);
    return Array.from(new Uint8Array(derived)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return `plain:${text}`;
  }
}

/* Message unique et clair (pas de checklist permanente) — retourne null si le mot de passe est valide */
function passwordErrorMessage(pw) {
  if (!pw) return null;
  if (pw.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
  if (!/[A-Z]/.test(pw)) return "Une majuscule est obligatoire.";
  if (!/[a-z]/.test(pw)) return "Une minuscule est obligatoire.";
  if (!/[0-9]/.test(pw)) return "Un chiffre est obligatoire.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Un caractère spécial est obligatoire.";
  return null;
}

/* ---------------------------------------------------------------------
   Storage helpers (shared = visible à tous ; personal = propre à l'appareil)
--------------------------------------------------------------------- */
async function loadCollection(key, fallback, shared = true) {
  try {
    const res = await window.storage.get(key, shared);
    if (!res) return fallback;
    return JSON.parse(res.value);
  } catch {
    return fallback;
  }
}
async function saveCollection(key, value, shared = true) {
  try {
    await window.storage.set(key, JSON.stringify(value), shared);
  } catch { /* best effort */ }
}

async function saveLocalSession(profile, rememberMe = false) {
  try {
    await window.storage.set("gowlsec:session", JSON.stringify({
      profileId: profile?.id || null,
      rememberMe: !!rememberMe,
      updatedAt: new Date().toISOString(),
    }), false);
  } catch { /* best effort */ }
}

async function clearSession() {
  try {
    await window.storage.set("gowlsec:session", JSON.stringify({ profileId: null, rememberMe: false, updatedAt: new Date().toISOString() }), false);
  } catch { /* best effort */ }
}

/* ---------------------------------------------------------------------
   UI atoms
--------------------------------------------------------------------- */
function Chip({ label, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs rounded"
      style={{ color, border: `1px solid ${color}55`, background: `${color}14`, fontFamily: MONO_FONT }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
function Panel({ children, className = "", style = {}, onClick }) {
  return (
    <div onClick={onClick} className={`rounded-lg relative ${className}`}
      style={{ background: C.panel, border: `1px solid ${C.line}`, boxShadow: "inset 0 1px 0 0 #ffffff0A", ...style }}>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block mb-1 text-xs uppercase tracking-wide" style={{ color: C.muted, fontFamily: MONO_FONT }}>{label}</span>
      {children}
    </label>
  );
}
const inputStyle = { background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontFamily: BODY_FONT };

function PrimaryButton({ children, onClick, type = "button", disabled, style = {} }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(e);
  };
  return (
    <button type={type} onClick={handleClick} disabled={disabled}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-opacity disabled:opacity-40"
      style={{ background: C.primary, color: "#fff", fontFamily: BODY_FONT, ...style }}>
      {children}
    </button>
  );
}
function GhostButton({ children, onClick, danger }) {
  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(e);
  };
  return (
    <button onClick={handleClick} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors"
      style={{ border: `1px solid ${danger ? C.alert + "66" : C.line}`, color: danger ? C.alert : C.muted, background: "transparent", fontFamily: BODY_FONT }}>
      {children}
    </button>
  );
}
function GuestGate({ text = "Connecte-toi pour participer.", accent = C.primary }) {
  return (
    <div className="rounded-xl border p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between" style={{ borderColor: `${accent}40`, background: `${accent}0C` }}>
      <p className="text-sm flex items-center gap-2" style={{ color: C.text, fontFamily: BODY_FONT }}>
        <Lock size={14} color={accent} /> {text}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <GhostButton onClick={() => window.dispatchEvent(new CustomEvent("open-auth-login"))}>Se connecter</GhostButton>
        <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent("open-auth-register"))} style={{ background: accent }}>S'inscrire</PrimaryButton>
      </div>
    </div>
  );
}
function EmptyState({ text, icon, accent = C.primary, cta, onCta }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center py-10 px-6 rounded-xl relative overflow-hidden" style={{ border: `1px dashed ${accent}44`, background: `linear-gradient(180deg, ${accent}0A, transparent)` }}>
      <div aria-hidden className="gowl-podium-spot" style={{ width: 160, height: 160, left: "50%", top: "10%", marginLeft: -80, background: accent, opacity: 0.25 }} />
      {icon && (
        <span className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: `${accent}1A`, border: `1px solid ${accent}44`, color: accent }}>
          {icon}
        </span>
      )}
      <p className="relative text-sm max-w-sm" style={{ color: C.muted, fontFamily: BODY_FONT }}>{text}</p>
      {cta && <div className="relative mt-3"><PrimaryButton onClick={onCta}>{cta}</PrimaryButton></div>}
    </div>
  );
}
function StatCardsRow({ items, vertical = false }) {
  return (
    <div className={vertical ? "flex flex-col gap-3" : "flex flex-wrap items-stretch gap-3 mb-6"}>
      {items.map((s, i) => (
        <div key={i} className={vertical ? "rounded-xl px-4 py-3 gowl-glass relative overflow-hidden" : "flex-1 min-w-[150px] rounded-xl px-4 py-3 gowl-glass relative overflow-hidden"} style={{ border: `1px solid ${s.accent}44` }}>
          <span className="gowl-inner-line" />
          <div className="flex items-center gap-2 mb-1" style={{ color: s.accent }}>{s.icon}<span className="text-[10px] uppercase gowl-mono-tag">{s.label}</span></div>
          <p className="text-2xl font-extrabold truncate gowl-count-pop" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
function InfoSidebar({ children }) {
  return (
    <aside className="w-full lg:w-[240px] shrink-0 flex flex-col gap-3">
      {children}
    </aside>
  );
}
function StatChip({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ border: `1px solid ${C.line}`, background: C.panel }}>
      <span style={{ color: C.primary }}>{icon}</span>
      <span className="text-sm font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{value}</span>
      <span className="text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>{label}</span>
    </div>
  );
}
function Avatar({ profile, size = 32 }) {
  if (profile?.avatarImage) {
    return (
      <div className="rounded-full overflow-hidden shrink-0" style={{ width: size, height: size }}>
        <img src={profile.avatarImage} alt="avatar" className="w-full h-full object-cover" />
      </div>
    );
  }
  const a = AVATAR_MAP[profile?.avatarKey] || AVATAR_OPTIONS[0];
  const Icon = a.icon;
  return (
    <div className="rounded-full flex items-center justify-center shrink-0" style={{ width: size, height: size, background: a.color }}>
      <Icon size={Math.round(size * 0.55)} color="#fff" />
    </div>
  );
}
function MemberAvatarStack({ profiles = [], max = 6 }) {
  const shown = profiles.slice(0, max);
  return (
    <div className="flex -space-x-2.5">
      {shown.length === 0
        ? AVATAR_OPTIONS.slice(0, 5).map((a, i) => {
            const Icon = a.icon;
            return (
              <div key={a.key} className="rounded-full flex items-center justify-center" style={{ width: 30, height: 30, background: a.color, border: `2px solid ${C.bg}`, zIndex: 10 - i }}>
                <Icon size={15} color="#fff" />
              </div>
            );
          })
        : shown.map((p, i) => (
            <div key={p.id} className="rounded-full" style={{ border: `2px solid ${C.bg}`, zIndex: 10 - i }}>
              <Avatar profile={p} size={30} />
            </div>
          ))}
    </div>
  );
}
function TeamLogo({ team, size = 40 }) {
  if (team.logoType === "image" && team.logoValue) {
    return <img src={team.logoValue} alt="" className="rounded-md object-cover shrink-0" style={{ width: size, height: size }} />;
  }
  return (
    <div className="rounded-md flex items-center justify-center shrink-0" style={{ width: size, height: size, background: C.panel2, border: `1px solid ${C.line}`, fontSize: Math.round(size * 0.5) }}>
      {team.logoValue || "🛡️"}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Logo — écusson hibou (cybersécurité)
--------------------------------------------------------------------- */
function OwlLogo({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 4 58 14v16c0 18-11.5 28.5-26 30C17.5 58.5 6 48 6 30V14L32 4Z" fill={C.panel2} stroke={C.primary} strokeWidth="2" />
      <path d="M20 15 14 7 25 13Z" fill={C.primary} opacity="0.85" />
      <path d="M44 15 50 7 39 13Z" fill={C.primary} opacity="0.85" />
      <circle cx="23" cy="30" r="9" fill={C.primary} />
      <circle cx="41" cy="30" r="9" fill={C.ok} />
      <circle cx="23" cy="30" r="3.4" fill={C.bg} />
      <circle cx="41" cy="30" r="3.4" fill={C.bg} />
      <polygon points="32,38 27,46 37,46" fill={C.gold} />
    </svg>
  );
}

/* ---------------------------------------------------------------------
   Indicateur "en ligne" — header
--------------------------------------------------------------------- */
function OnlineIndicator() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const listing = await window.storage.list("gowlsec:presence:", true);
        const keys = listing?.keys || [];
        const results = await Promise.all(keys.map(async (k) => {
          try {
            const r = await window.storage.get(k, true);
            return r ? JSON.parse(r.value) : null;
          } catch { return null; }
        }));
        if (!active) return;
        const now = Date.now();
        setCount(results.filter(Boolean).filter((p) => now - new Date(p.lastSeen).getTime() < ONLINE_WINDOW_MS).length);
      } catch { /* best effort */ }
    }
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);
  if (count === null) return null;
  return (
    <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ border: `1px solid ${C.line}`, color: C.muted, fontFamily: MONO_FONT }}>
      <Circle size={7} fill={C.ok} color={C.ok} /> {count} en ligne
    </span>
  );
}

/* ---------------------------------------------------------------------
   Badge "live" pulsant — pour dynamiser l'accueil
--------------------------------------------------------------------- */
function LivePulseBadge({ count }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: `${C.ok}14`, border: `1px solid ${C.ok}40`, color: C.ok, fontFamily: MONO_FONT }}>
      <span className="relative inline-flex w-2 h-2">
        <span className="absolute inline-flex w-full h-full rounded-full" style={{ background: C.ok, animation: "gowl-ping-ring 1.8s cubic-bezier(0,0,0.2,1) infinite" }} />
        <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: C.ok }} />
      </span>
      {count === null ? "communauté active" : `${count} en ligne maintenant`}
    </span>
  );
}

function NavMoreMenu({ tabs, tab, setTab, lang }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const activeInMenu = tabs.some((t) => t.key === tab);

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  }, [open]);

  if (tabs.length === 0) return null;
  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen((o) => !o)} className="relative flex items-center gap-1 px-3 py-[7px] text-[13px] font-semibold whitespace-nowrap rounded-lg transition-all duration-200"
        style={{
          color: activeInMenu ? "#fff" : C.muted,
          background: activeInMenu ? `linear-gradient(155deg, ${C.primary}, ${C.primary}CC)` : "transparent",
          fontFamily: BODY_FONT,
        }}>
        Plus <ChevronDown size={13} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }} />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="fixed py-1.5 rounded-xl z-[9999] min-w-[190px]" style={{ top: pos.top, right: pos.right, background: C.panel, border: `1px solid ${C.line}`, boxShadow: "0 16px 40px -12px rgba(0,0,0,0.65)" }}>
            {tabs.map((t) => {
              const active = tab === t.key;
              const Icon = t.icon;
              return (
                <button key={t.key} onClick={() => { setTab(t.key); setOpen(false); }} className="flex items-center gap-2.5 w-full px-3.5 py-2 text-[13px] text-left"
                  style={{ color: active ? C.primary : C.text, background: active ? `${C.primary}14` : "transparent", fontFamily: BODY_FONT }}>
                  {Icon && <Icon size={14} />} {(I18N[lang || "fr"].tabs[t.key]) || t.label}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Sélection de langue — écran d'entrée + mini switcher dans le header
--------------------------------------------------------------------- */
function LanguageGate({ onChoose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: `${C.bg}F5`, backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-md rounded-2xl p-6 gowl-fade-up relative overflow-hidden" style={{ background: C.panel, border: `1px solid ${C.line}`, boxShadow: "0 24px 60px -20px rgba(0,0,0,0.6)" }}>
        <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ width: 260, height: 260, top: -110, right: -90, background: `radial-gradient(circle, ${C.primary}30, transparent 70%)`, filter: "blur(10px)" }} />
        <div className="flex items-center gap-2.5 mb-5 relative">
          <OwlLogo size={28} />
          <span className="font-extrabold text-lg" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>GowlSec</span>
        </div>
        <h2 className="text-lg font-bold mb-1.5 relative" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Choose your language · Choisis ta langue</h2>
        <p className="text-xs mb-5 relative" style={{ color: C.muted, fontFamily: BODY_FONT }}>选择语言 · Выберите язык</p>
        <div className="grid grid-cols-2 gap-2.5 relative">
          {LANGUAGES.map((l) => (
            <button key={l.key} onClick={() => onChoose(l.key)} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-all hover:-translate-y-0.5"
              style={{ background: C.panel2, border: `1px solid ${C.line}` }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.primary; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.line; }}>
              <span className="text-2xl">{l.flag}</span>
              <span className="text-sm font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{l.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
function LangSwitcher({ lang, onChoose }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const current = LANGUAGES.find((l) => l.key === lang) || LANGUAGES[0];

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  }, [open]);

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: C.panel2, border: `1px solid ${C.line}`, color: C.text, fontFamily: MONO_FONT }}>
        <span>{current.flag}</span> {current.short}
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div className="fixed py-1 rounded-lg z-[9999] min-w-[140px]" style={{ top: pos.top, right: pos.right, background: C.panel, border: `1px solid ${C.line}`, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.6)" }}>
            {LANGUAGES.map((l) => (
              <button key={l.key} onClick={() => { onChoose(l.key); setOpen(false); }} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left"
                style={{ color: l.key === lang ? C.primary : C.text, background: l.key === lang ? `${C.primary}14` : "transparent", fontFamily: BODY_FONT }}>
                <span>{l.flag}</span> {l.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Auth widget (haut à droite) — Discord + email/mot de passe
--------------------------------------------------------------------- */
/* ---------------------------------------------------------------------
   Toast — notifications élégantes (remplace le texte rouge brut)
--------------------------------------------------------------------- */
function AuthToast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [toast, onDone]);

  if (!toast) return null;
  const isError = toast.type === "error";
  const accent = isError ? C.alert : C.ok;
  return (
    <div
      className="gowl-toast fixed left-1/2 z-[100000000] flex items-start gap-2.5 px-4 py-3 rounded-2xl"
      style={{
        top: "1.25rem",
        transform: "translateX(-50%)",
        background: `linear-gradient(160deg, ${C.panel} 0%, #0b0e13 100%)`,
        border: `1px solid ${accent}55`,
        boxShadow: `0 18px 40px -12px rgba(0,0,0,0.65), 0 0 0 1px ${accent}22, 0 0 24px -6px ${accent}66`,
        maxWidth: "min(420px, calc(100vw - 2rem))",
      }}
      role="alert"
    >
      <span className="mt-0.5 shrink-0" style={{ color: accent }}>
        {isError ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
      </span>
      <p className="text-sm leading-snug" style={{ color: C.text, fontFamily: BODY_FONT }}>{toast.message}</p>
      <button onClick={onDone} className="ml-1 shrink-0 opacity-60 hover:opacity-100 transition-opacity" style={{ color: C.muted }}>
        <X size={13} />
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Champ mot de passe réutilisable — oeil pour afficher/masquer,
   validation en direct sans checklist permanente
--------------------------------------------------------------------- */
function PasswordField({ label, value, onChange, show, onToggleShow, placeholder, validate = false, autoComplete }) {
  const msg = validate ? passwordErrorMessage(value) : null;
  const isValid = validate && value && !msg;
  return (
    <Field label={label}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="gowl-auth-input w-full pl-3 pr-10 py-2.5 rounded-xl text-sm"
          style={{ ...inputStyle, background: `${C.panel2}CC` }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggleShow}
          className="gowl-eye-btn absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: C.muted }}
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {validate && value && (
        msg ? (
          <p className="gowl-fade-in flex items-center gap-1.5 text-xs mt-1.5" style={{ color: C.alert, fontFamily: BODY_FONT }}>
            <AlertTriangle size={12} className="shrink-0" /> {msg}
          </p>
        ) : (
          <p className="gowl-fade-in flex items-center gap-1.5 text-xs mt-1.5" style={{ color: C.ok, fontFamily: BODY_FONT }}>
            <CheckCircle2 size={12} className="shrink-0" /> Mot de passe valide
          </p>
        )
      )}
    </Field>
  );
}

/* ---------------------------------------------------------------------
   Conseils & Ressources — contenu qui tourne chaque jour (+ légère
   rotation automatique pendant que le panneau est ouvert)
--------------------------------------------------------------------- */
const TIP_SECTIONS = [
  {
    key: "astuce", label: "Astuce du jour", emoji: "💡", icon: <Lightbulb size={13} />, color: C.gold,
    items: [
      "Utilise toujours des mots de passe uniques avec un gestionnaire comme Bitwarden.",
      "Ne réutilise jamais le même mot de passe sur plusieurs sites.",
      "Vérifie toujours l'URL avant de saisir tes identifiants.",
      "Chiffre ton disque avec BitLocker ou LUKS pour protéger tes données.",
      "Fais des sauvegardes régulières et hors-ligne de tes fichiers importants.",
    ],
  },
  {
    key: "lab", label: "Lab recommandé", emoji: "🧪", icon: <FlaskConical size={13} />, color: C.primary,
    items: [
      "Hack The Box – Meow (débutant, prise en main Linux).",
      "TryHackMe – Pre Security (bases réseau et sécurité).",
      "Root-Me – Web-Client (fondamentaux du web).",
      "TryHackMe – Blue (exploitation Windows EternalBlue).",
      "Hack The Box – Lame (SMB & élévation de privilèges).",
    ],
  },
  {
    key: "outil", label: "Outil recommandé", emoji: "🛠️", icon: <Wrench size={13} />, color: C.ok,
    items: [
      "Nmap – scanner de ports et de services réseau.",
      "Burp Suite – proxy d'interception pour le pentest web.",
      "Wireshark – analyse fine du trafic réseau.",
      "Gobuster – brute-force de répertoires et sous-domaines.",
      "ffuf – fuzzing HTTP rapide et flexible.",
    ],
  },
  {
    key: "ressource", label: "Ressource du jour", emoji: "📚", icon: <BookOpen size={13} />, color: C.warn,
    items: [
      "OWASP Top 10 – les failles web les plus critiques à connaître.",
      "PortSwigger Web Security Academy – cours gratuit sur le pentest web.",
      "HackTricks – wiki de techniques offensives très complet.",
      "GTFOBins – techniques d'élévation de privilèges sous Linux.",
      "MITRE ATT&CK – la matrice de référence des tactiques d'attaque.",
    ],
  },
  {
    key: "defi", label: "Défi du jour", emoji: "🎯", icon: <Target size={13} />, color: C.alert,
    items: [
      "Trouve les ports ouverts d'une machine locale avec Nmap.",
      "Identifie la techno d'un serveur web avec whatweb ou curl -I.",
      "Décode une chaîne encodée en Base64 sans outil en ligne.",
      "Trouve un sous-domaine caché avec un outil de brute-force DNS.",
      "Analyse une capture réseau et retrouve un mot de passe en clair.",
    ],
  },
  {
    key: "conseil", label: "Conseil sécurité", emoji: "💬", icon: <Shield size={13} />, color: C.discord,
    items: [
      "Active l'authentification à deux facteurs (2FA) sur tes comptes importants.",
      "Ne clique jamais sur un lien suspect reçu par e-mail.",
      "Vérifie régulièrement les autorisations de tes applications connectées.",
      "Mets à jour tes systèmes et logiciels dès que possible.",
      "Méfie-toi des réseaux Wi-Fi publics non chiffrés.",
    ],
  },
];

function TipCard({ section, dayIndex }) {
  const [pos, setPos] = useState(dayIndex % section.items.length);
  useEffect(() => {
    setPos(dayIndex % section.items.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayIndex]);
  useEffect(() => {
    const delay = 9000 + Math.random() * 4000;
    const id = setInterval(() => {
      setPos((p) => (p + 1) % section.items.length);
    }, delay);
    return () => clearInterval(id);
  }, [section.items.length]);

  return (
    <div
      className="gowl-tip-card relative overflow-hidden rounded-xl px-3 py-2.5"
      style={{ background: `${C.panel}CC`, border: `1px solid ${section.color}2E`, "--gowl-tip-accent": section.color }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: `${section.color}1E`, color: section.color }}>
          {section.icon}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: section.color, fontFamily: MONO_FONT }}>
          {section.emoji} {section.label}
        </span>
      </div>
      <p key={pos} className="gowl-fade-in text-xs leading-snug pl-0.5" style={{ color: C.text, fontFamily: BODY_FONT }}>
        {section.items[pos]}
      </p>
    </div>
  );
}

function AuthWidget({ currentUser, setCurrentUser, profiles, setProfiles, credentials, setCredentials, setTab }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotStep, setForgotStep] = useState("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [portalTarget, setPortalTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPw, setShowPw] = useState({ password: false, newPassword: false, newPasswordConfirm: false });

  useEffect(() => {
    if (typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const openRegister = () => { setMode("register"); openModal(); };
    const openLogin = () => { setMode("login"); openModal(); };
    window.addEventListener("open-auth-register", openRegister);
    window.addEventListener("open-auth-login", openLogin);
    return () => {
      window.removeEventListener("open-auth-register", openRegister);
      window.removeEventListener("open-auth-login", openLogin);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === "Escape") closeModal(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function reset() {
    setEmail(""); setPassword(""); setBusy(false); setRememberMe(false);
    setForgotStep("email"); setForgotEmail(""); setNewPassword(""); setNewPasswordConfirm("");
    setShowPw({ password: false, newPassword: false, newPasswordConfirm: false });
  }

  function openModal() {
    setClosing(false);
    setOpen(true);
    reset();
    setToast(null);
  }

  function closeModal() {
    if (!open || closing) return;
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
      reset();
      setToast(null);
    }, 200);
  }

  function notify(type, message) {
    setToast({ type, message });
  }

  function connectDiscord() {
    notify("success", "La connexion via Discord arrive bientôt — utilise l'e-mail en attendant.");
  }

  async function submitLogin(e) {
  e.preventDefault();

  setBusy(true);

  try {
    const result = await login({
      email: email.trim().toLowerCase(),
      password,
    });

    await (rememberMe ? saveSession(result.user, true) : clearSession());

    notify("success", "Connexion réussie.");

    setCurrentUser(result.user);
    closeModal();

  } catch (err) {
    notify("error", err.message || "Erreur de connexion.");
  } finally {
    setBusy(false);
  }
}

  function submitForgotStart(e) {
    e.preventDefault();
    setForgotStep("reset");
  }

  function submitForgotReset(e) {
    e.preventDefault();
    setForgotStep("done");
  }

  if (currentUser) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={() => setTab("profil")} className="gowl-userchip flex items-center gap-2 rounded-full px-2.5 py-1.5" style={{ background: `${C.panel2}CC`, border: `1px solid ${C.line}` }}>
          <Avatar profile={currentUser} size={30} />
          <span className="text-sm hidden sm:inline" style={{ color: C.text, fontFamily: BODY_FONT }}>{currentUser.username}</span>
        </button>
        <button onClick={async () => { await clearSession(); setCurrentUser(null); }} title="Se déconnecter" className="gowl-icon-btn" style={{ color: C.muted }}><LogOut size={15} /></button>
      </div>
    );
  }

  return (
    <div className="relative z-[200]">
      <button onClick={() => (open ? closeModal() : openModal())} className="gowl-cta-btn inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold border"
        style={{ background: "linear-gradient(120deg, #5B6EF5 0%, #2ED9A3 100%)", color: "#fff", borderColor: "rgba(255,255,255,0.12)", fontFamily: BODY_FONT, boxShadow: "0 8px 24px rgba(91,110,245,0.25)" }}>
        <Lock size={14} /> Connexion
      </button>
      {open && portalTarget && createPortal(
        <div
          className={`gowl-auth-backdrop fixed inset-0 flex items-center justify-center p-4 ${closing ? "gowl-backdrop-out" : "gowl-backdrop-in"}`}
          style={{ position: "fixed", inset: 0, zIndex: 9999999, background: "rgba(3, 6, 12, 0.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", isolation: "isolate" }}
          onClick={closeModal}
        >
          <AuthToast toast={toast} onDone={() => setToast(null)} />
          <div
            className={`gowl-auth-panel relative w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto ${closing ? "gowl-modal-out" : "gowl-modal-in"}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: `linear-gradient(150deg, ${C.panel}F2 0%, #0b0e14F5 100%)`,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid rgba(255,255,255,0.08)`,
              boxShadow: `0 0 0 1px ${C.primary}14 inset, 0 32px 100px -20px rgba(0,0,0,0.85), 0 0 60px -20px ${C.primary}33`,
            }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${C.primary}22, transparent 34%), radial-gradient(circle at bottom left, ${C.ok}10, transparent 36%)` }} />
            <div className="relative">
              <div className="p-5">
                <div className="flex items-start justify-between mb-5 gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.28em] mb-2.5" style={{ background: `${C.primary}16`, color: C.primary, border: `1px solid ${C.primary}33`, fontFamily: MONO_FONT }}>
                      <Radio size={12} /> Portail sécurisé
                    </div>
                    <h3 className="text-xl sm:text-2xl font-semibold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>
                      {mode === "forgot" ? "Réinitialiser le mot de passe" : "Rejoignez la stack GowlSec"}
                    </h3>
                    <p className="text-sm mt-1.5" style={{ color: C.muted, fontFamily: BODY_FONT }}>
                      {mode === "forgot" ? "Retrouve l'accès à ton compte en quelques secondes." : "Connexion fluide, inscription premium et expérience cyber startup pensée pour durer."}
                    </p>
                  </div>
                  <button onClick={closeModal} className="gowl-icon-btn w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${C.panel2}CC`, color: C.muted, border: `1px solid ${C.line}` }}><X size={14} /></button>
                </div>

                {mode !== "forgot" && (
                  <>
                    <div className="rounded-2xl border p-3.5 mb-4" style={{ background: `${C.panel2}CC`, borderColor: `${C.primary}22` }}>
                      <button onClick={connectDiscord}
                        className="gowl-discord-btn w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                        style={{
                          background: "linear-gradient(135deg, #5865F2 0%, #7289DA 100%)",
                          color: "#fff",
                          fontFamily: BODY_FONT,
                          boxShadow: "0 10px 24px rgba(88, 101, 242, 0.28)",
                        }}
                      >
                        <MessageSquare size={17} />
                        <span>Continuer avec Discord</span>
                      </button>
                      <p className="text-xs mt-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>
                        Connexion Discord bientôt disponible — utilise l'e-mail en attendant.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-px" style={{ background: C.line }} />
                      <span className="text-[11px] uppercase tracking-[0.22em]" style={{ color: C.muted, fontFamily: MONO_FONT }}>ou par e-mail</span>
                      <div className="flex-1 h-px" style={{ background: C.line }} />
                    </div>

                    <div className="gowl-tab-switch relative flex gap-1 mb-4 p-1 rounded-xl" style={{ background: `${C.panel2}CC`, border: `1px solid ${C.line}` }}>
                      <span
                        aria-hidden
                        className="gowl-tab-indicator absolute top-1 bottom-1 rounded-lg"
                        style={{
                          width: "calc(50% - 4px)",
                          left: mode === "login" ? 4 : "calc(50% + 0px)",
                          background: "linear-gradient(120deg, #5B6EF5 0%, #2ED9A3 100%)",
                        }}
                      />
                      <button onClick={() => setMode("login")} className="relative z-[1] flex-1 text-xs py-1.8 rounded-lg transition-colors duration-200"
                        style={{ color: mode === "login" ? "#fff" : C.muted, fontFamily: BODY_FONT }}>Connexion</button>
                      <button onClick={() => setMode("register")} className="relative z-[1] flex-1 text-xs py-1.8 rounded-lg transition-colors duration-200"
                        style={{ color: mode === "register" ? "#fff" : C.muted, fontFamily: BODY_FONT }}>Inscription</button>
                    </div>
                  </>
                )}

                {mode === "login" ? (
                  <form onSubmit={submitLogin} className="space-y-2.5 gowl-fade-in">
                    <Field label="E-mail"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="root@gowlsec.fr" autoComplete="email" className="gowl-auth-input w-full px-3 py-2.5 rounded-xl text-sm" style={{ ...inputStyle, background: `${C.panel2}CC` }} /></Field>
                    <PasswordField
                      label="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)}
                      show={showPw.password} onToggleShow={() => setShowPw((s) => ({ ...s, password: !s.password }))}
                      autoComplete="current-password"
                    />
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: C.muted, fontFamily: BODY_FONT }}>
                        <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ accentColor: C.primary }} />
                        Se souvenir de moi sur cet appareil
                      </label>
                      <button type="button" onClick={() => { setMode("forgot"); setForgotStep("email"); setForgotEmail(email); }}
                        className="text-xs underline underline-offset-2 gowl-link" style={{ color: C.primary, fontFamily: BODY_FONT }}>
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <PrimaryButton type="submit" disabled={busy} style={{ background: "linear-gradient(120deg, #5B6EF5 0%, #2ED9A3 100%)", width: "100%", justifyContent: "center" }}>
                      {busy ? <><Loader2 size={15} className="animate-spin" /> Connexion…</> : "Se connecter"}
                    </PrimaryButton>
                  </form>
                ) : mode === "forgot" ? (
                  forgotStep === "done" ? (
                    <div className="space-y-3 gowl-fade-in">
                      <div className="rounded-xl border p-3 flex items-start gap-2" style={{ borderColor: `${C.ok}44`, background: `${C.ok}12` }}>
                        <CheckCircle2 size={16} color={C.ok} />
                        <p className="text-sm" style={{ color: C.text, fontFamily: BODY_FONT }}>Mot de passe mis à jour. Tu peux te reconnecter dès maintenant.</p>
                      </div>
                      <PrimaryButton onClick={() => { setMode("login"); setPassword(""); }} style={{ background: "linear-gradient(120deg, #5B6EF5 0%, #2ED9A3 100%)", width: "100%", justifyContent: "center" }}>Retour à la connexion</PrimaryButton>
                    </div>
                  ) : forgotStep === "email" ? (
                    <form onSubmit={submitForgotStart} className="space-y-2.5 gowl-fade-in">
                      <p className="text-xs mb-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>Indique l'e-mail de ton compte pour recevoir un lien de réinitialisation.</p>
                      <Field label="E-mail du compte"><input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="toi@exemple.fr" className="gowl-auth-input w-full px-3 py-2.5 rounded-xl text-sm" style={{ ...inputStyle, background: `${C.panel2}CC` }} /></Field>
                      <PrimaryButton type="submit" style={{ background: "linear-gradient(120deg, #5B6EF5 0%, #2ED9A3 100%)", width: "100%", justifyContent: "center" }}>Envoyer le lien</PrimaryButton>
                      <button type="button" onClick={() => setMode("login")} className="text-xs underline underline-offset-2 block gowl-link" style={{ color: C.muted, fontFamily: BODY_FONT }}>Retour à la connexion</button>
                    </form>
                  ) : (
                    <form onSubmit={submitForgotReset} className="space-y-2.5 gowl-fade-in">
                      <PasswordField
                        label="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        show={showPw.newPassword} onToggleShow={() => setShowPw((s) => ({ ...s, newPassword: !s.newPassword }))}
                        validate autoComplete="new-password"
                      />
                      <PasswordField
                        label="Confirmer le nouveau mot de passe" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        show={showPw.newPasswordConfirm} onToggleShow={() => setShowPw((s) => ({ ...s, newPasswordConfirm: !s.newPasswordConfirm }))}
                        autoComplete="new-password"
                      />
                      <PrimaryButton type="submit" style={{ background: "linear-gradient(120deg, #5B6EF5 0%, #2ED9A3 100%)", width: "100%", justifyContent: "center" }}>Définir le nouveau mot de passe</PrimaryButton>
                      <button type="button" onClick={() => setMode("login")} className="text-xs underline underline-offset-2 block gowl-link" style={{ color: C.muted, fontFamily: BODY_FONT }}>Annuler</button>
                    </form>
                  )
                ) : (
                  <div className="space-y-2.5 gowl-fade-in">
                    <Register />
                    <button
                      type="button"
                      onClick={() => notify("success", "E-mail de vérification renvoyé.")}
                      className="text-xs underline underline-offset-2 block gowl-link"
                      style={{ color: C.muted, fontFamily: BODY_FONT }}
                    >
                      Renvoyer l'e-mail de vérification
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        portalTarget
      )}
      <style>{`
        @keyframes gowl-backdrop-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gowl-backdrop-fade-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes gowl-modal-pop-in {
          from { opacity: 0; transform: translateY(14px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gowl-modal-pop-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(10px) scale(0.97); }
        }
        @keyframes gowl-toast-in { from { opacity: 0; transform: translate(-50%, -14px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes gowl-fade-in-kf { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }

        .gowl-backdrop-in { animation: gowl-backdrop-fade-in 0.22s ease-out both; }
        .gowl-backdrop-out { animation: gowl-backdrop-fade-out 0.2s ease-in both; }
        .gowl-modal-in { animation: gowl-modal-pop-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .gowl-modal-out { animation: gowl-modal-pop-out 0.2s ease-in both; }
        .gowl-toast { animation: gowl-toast-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .gowl-fade-in { animation: gowl-fade-in-kf 0.18s ease-out both; }

        .gowl-cta-btn { transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease; }
        .gowl-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(91,110,245,0.38); filter: brightness(1.05); }
        .gowl-cta-btn:active { transform: translateY(0); }

        .gowl-icon-btn, .gowl-eye-btn, .gowl-link, .gowl-userchip, .gowl-discord-btn, .gowl-avatar-pick, .gowl-tab-switch button {
          transition: transform 0.18s ease, background-color 0.18s ease, color 0.18s ease, opacity 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
        }
        .gowl-icon-btn:hover { background: ${C.line}66; color: ${C.text}; transform: rotate(90deg); }
        .gowl-eye-btn:hover { background: ${C.line}77; color: ${C.text}; }
        .gowl-userchip:hover { border-color: ${C.primary}66; transform: translateY(-1px); }
        .gowl-link:hover { opacity: 0.8; }
        .gowl-discord-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 14px 30px rgba(88,101,242,0.42); filter: brightness(1.06); }
        .gowl-discord-btn:active:not(:disabled) { transform: translateY(0); }
        .gowl-avatar-pick:hover { filter: brightness(1.15); transform: scale(1.1) !important; }

        .gowl-tab-indicator { transition: left 0.28s cubic-bezier(0.16, 1, 0.3, 1); }

        .gowl-auth-input { transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease; }
        .gowl-auth-input:focus { outline: none; border-color: ${C.primary}88 !important; box-shadow: 0 0 0 3px ${C.primary}22; }

        .gowl-auth-panel { will-change: transform, opacity; }

        .gowl-tip-card { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .gowl-tip-card:hover { transform: translateY(-2px); border-color: var(--gowl-tip-accent, ${C.primary})66 !important; box-shadow: 0 10px 22px -10px var(--gowl-tip-accent, ${C.primary})77; }

        @keyframes gowl-stat-glow-kf { 0%, 100% { box-shadow: 0 0 0 0 var(--gowl-stat-accent, ${C.primary})33; } 50% { box-shadow: 0 0 16px 1px var(--gowl-stat-accent, ${C.primary})33; } }
        .gowl-stat-glow { animation: gowl-stat-glow-kf 3.2s ease-in-out infinite; transition: transform 0.2s ease; }
        .gowl-stat-glow:hover { transform: translateY(-2px); }

        @media (prefers-reduced-motion: reduce) {
          .gowl-stat-glow { animation: none !important; }
          .gowl-backdrop-in, .gowl-backdrop-out, .gowl-modal-in, .gowl-modal-out, .gowl-toast, .gowl-fade-in { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function AuthSidebarInfo({ profiles }) {
  const [online, setOnline] = useState(() => 9 + Math.floor(Math.random() * 15));
  useEffect(() => {
    const id = setInterval(() => {
      setOnline((o) => Math.max(4, Math.min(40, o + (Math.random() > 0.5 ? 1 : -1))));
    }, 4000);
    return () => clearInterval(id);
  }, []);
  const dayIndex = useMemo(() => dayOfYear(), []);
  return (
    <div className="hidden lg:flex flex-col gap-3 p-5 sm:p-6" style={{ borderLeft: `1px solid rgba(255,255,255,0.06)`, background: `linear-gradient(180deg, ${C.panel2}CC 0%, rgba(10,12,16,0.9) 100%)` }}>
      <div className="grid grid-cols-2 gap-3">
        <div className="gowl-stat-glow rounded-2xl px-3 py-3 relative overflow-hidden" style={{ border: `1px solid ${C.ok}33`, background: `linear-gradient(140deg, ${C.ok}14, ${C.panel2}CC)`, backdropFilter: "blur(10px)", "--gowl-stat-accent": C.ok }}>
            <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 40%)" }} />
            <div className="relative flex items-center gap-1.5 mb-2" style={{ color: C.ok }}>
              <span className="gowl-live-dot" style={{ background: C.ok }} />
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: MONO_FONT }}>En ligne</span>
            </div>
            <p key={online} className="gowl-count-pop relative text-xl font-extrabold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{online}</p>
            <p className="relative text-[10px] mt-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>Utilisateur en ligne</p>
        </div>
        <div className="gowl-stat-glow rounded-2xl px-3 py-3 relative overflow-hidden" style={{ border: `1px solid ${C.primary}33`, background: `linear-gradient(140deg, ${C.primary}14, ${C.panel2}CC)`, backdropFilter: "blur(10px)", "--gowl-stat-accent": C.primary }}>
            <div className="absolute inset-0 opacity-50" style={{ background: "radial-gradient(circle at top right, rgba(255,255,255,0.08), transparent 40%)" }} />
            <div className="relative flex items-center gap-1.5 mb-2" style={{ color: C.primary }}>
              <Users size={12} />
              <span className="text-[10px] uppercase tracking-[0.2em]" style={{ fontFamily: MONO_FONT }}>Membres</span>
            </div>
            <p key={profiles.length} className="gowl-count-pop relative text-xl font-extrabold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{profiles.length}</p>
            <p className="relative text-[10px] mt-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>comptes créés</p>
        </div>
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] flex items-center gap-1.5 mb-2" style={{ color: C.muted, fontFamily: MONO_FONT }}>
          <Sparkles size={11} /> Conseils &amp; Ressources
        </span>
        <div className="flex flex-col gap-2">
          {TIP_SECTIONS.map((section) => (
            <TipCard key={section.key} section={section} dayIndex={dayIndex} />
          ))}
        </div>
      </div>
    </div>
  );
}



/* ---------------------------------------------------------------------
   Profil
--------------------------------------------------------------------- */
function ProfileTab({ currentUser, setCurrentUser, profiles, setProfiles, questions, trophies, labs = [], teams = [], messages = [], setTab }) {
  const [editing, setEditing] = useState(false);
  const [avatarKey, setAvatarKey] = useState(currentUser?.avatarKey);
  const [avatarImage, setAvatarImage] = useState(currentUser?.avatarImage || "");
  const [banner, setBanner] = useState(currentUser?.banner);
  const [bannerImage, setBannerImage] = useState(currentUser?.bannerImage || "");
  const [bannerColor, setBannerColor] = useState(currentUser?.bannerColor || "");
  const [github, setGithub] = useState(currentUser?.socials?.github || "");
  const [twitter, setTwitter] = useState(currentUser?.socials?.twitter || "");
  const [discord, setDiscord] = useState(currentUser?.socials?.discord || "");
  const [bio, setBio] = useState(currentUser?.bio || "");

  if (!currentUser) {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <UserIcon size={28} className="mx-auto mb-3" style={{ color: C.primary }} />
        <h2 className="text-lg font-bold mb-2" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Pas encore connecté</h2>
        <p className="text-sm" style={{ color: C.muted, fontFamily: BODY_FONT }}>Connecte-toi (e-mail ou Discord) pour créer et voir ton profil.</p>
      </div>
    );
  }

  const myQuestions = questions.filter((q) => q.author === currentUser.username).length;
  const myTrophies = trophies.filter((t) => t.author === currentUser.username).length;
  const bannerCss = bannerImage ? `url(${bannerImage}) center/cover no-repeat` : bannerColor ? `linear-gradient(135deg, ${bannerColor}, ${shadeColor(bannerColor, -35)})` : BANNER_MAP[banner] || BANNER_MAP.indigo;
  const socials = currentUser.socials || {};

  const myPoints = useMemo(() => computeUserPoints(currentUser.username, questions, trophies, labs), [currentUser.username, questions, trophies, labs]);
  const levelInfo = useMemo(() => getLevelInfo(myPoints), [myPoints]);

  const myActivity = useMemo(() => {
    const items = [
      ...questions.filter((q) => q.author === currentUser.username).map((q) => ({ kind: "question", id: q.id, text: `a posé la question « ${q.title} »`, createdAt: q.createdAt, tab: "forum" })),
      ...trophies.filter((t) => t.author === currentUser.username).map((t) => ({ kind: "trophy", id: t.id, text: `a débloqué le trophée ${t.platform} — ${t.title}`, createdAt: t.createdAt, tab: "trophies" })),
      ...teams.filter((t) => t.owner === currentUser.username).map((t) => ({ kind: "team", id: t.id, text: `a créé la team ${t.name}`, createdAt: t.createdAt, tab: "equipes" })),
      ...labs.filter((l) => l.owner === currentUser.username).map((l) => ({ kind: "lab", id: l.id, text: `a ouvert le salon lab ${l.title}`, createdAt: l.createdAt, tab: "labs" })),
      ...messages.filter((m) => m.author === currentUser.username).slice(-15).map((m) => ({ kind: "message", id: m.id, text: `a discuté sur le Hub`, createdAt: m.createdAt, tab: "salons" })),
    ];
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  }, [currentUser.username, questions, trophies, teams, labs, messages]);

  async function save() {
    const isPremium = !!currentUser.isPremium;
    const updated = {
      ...currentUser,
      avatarKey,
      avatarImage: isPremium ? avatarImage.trim() : "",
      banner,
      bannerImage: isPremium ? bannerImage.trim() : "",
      bannerColor: bannerColor.trim(),
      bio: bio.trim().slice(0, 160),
      socials: { github: github.trim(), twitter: twitter.trim(), discord: discord.trim() },
    };
    const next = profiles.map((p) => (p.id === currentUser.id ? updated : p));
    setProfiles(next);
    setCurrentUser(updated);
    await saveCollection("gowlsec:profiles", next);
    setEditing(false);
  }

  return (
    <div>
      <Panel className="overflow-hidden mb-6">
        <div className="h-36" style={{ background: bannerCss }} />
        <div className="px-5 pb-5">
          <div className="-mt-8 mb-3">
            <div className="inline-block rounded-full p-1" style={{ background: C.panel }}>
              <Avatar profile={{ avatarKey }} size={64} />
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{currentUser.username}</h2>
                {currentUser.isPremium && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold"
                    style={{ background: `${C.primary}20`, color: C.primary }}>
                    Premium
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>
                Membre depuis {timeAgo(currentUser.joinedAt)} · {currentUser.provider === "discord" ? "Discord" : "E-mail"}
                {currentUser.isPremium && currentUser.premiumUntil && (
                  <span className="ml-2 text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>
                    • Expire le {new Date(currentUser.premiumUntil).toLocaleDateString()}
                  </span>
                )}
              </p>
              {currentUser.bio && <p className="text-sm mt-2" style={{ color: C.text, fontFamily: BODY_FONT }}>{currentUser.bio}</p>}
            </div>
            <GhostButton onClick={() => setEditing((e) => !e)}><Pencil size={12} /> {editing ? "Annuler" : "Modifier"}</GhostButton>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            <StatChip icon={<Flag size={14} />} label="questions" value={myQuestions} />
            <StatChip icon={<Trophy size={14} />} label="trophées" value={myTrophies} />
            <StatChip icon={<Zap size={14} />} label="points" value={myPoints} />
          </div>

          <div className="mt-4 p-3 rounded-lg" style={{ background: C.panel2, border: `1px solid ${levelInfo.level.color}44` }}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5" style={{ color: levelInfo.level.color, fontFamily: MONO_FONT }}>
                <Gauge size={13} /> Niveau {levelInfo.level.label}
              </span>
              <span className="text-[11px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>
                {levelInfo.next ? `${levelInfo.pointsToNext} pts avant ${levelInfo.next.label}` : "Niveau maximum atteint"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: C.bg }}>
              <div className="h-full rounded-full gowl-bar-fill" style={{ width: `${levelInfo.pct}%`, background: levelInfo.level.color }} />
            </div>
          </div>

          {(socials.github || socials.twitter || socials.discord) && !editing && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
              {socials.github && (
                <a href={socials.github.startsWith("http") ? socials.github : `https://github.com/${socials.github.replace(/^@/, "")}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs" style={{ border: `1px solid ${C.line}`, color: C.text, fontFamily: BODY_FONT }}>
                  <GitHubIcon size={13} /> GitHub
                </a>
              )}
              {socials.twitter && (
                <a href={socials.twitter.startsWith("http") ? socials.twitter : `https://twitter.com/${socials.twitter.replace(/^@/, "")}`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs" style={{ border: `1px solid ${C.line}`, color: C.text, fontFamily: BODY_FONT }}>
                  <XIcon size={13} /> X (Twitter)
                </a>
              )}
              {socials.discord && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs" style={{ border: `1px solid ${C.line}`, color: C.text, fontFamily: BODY_FONT }}>
                  <MessageCircle size={13} /> {socials.discord}
                </span>
              )}
            </div>
          )}
        </div>
      </Panel>

      <Panel className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} style={{ color: C.ok }} />
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: C.muted, fontFamily: MONO_FONT }}>Fil d'activité</span>
        </div>
        {myActivity.length === 0 ? (
          <p className="text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>Aucune activité pour l'instant — pose une question, ajoute un trophée ou ouvre un salon lab.</p>
        ) : (
          <div className="space-y-1.5">
            {myActivity.map((item) => (
              <button key={`${item.kind}-${item.id}`} onClick={() => setTab(item.tab)} className="flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md transition-colors hover:opacity-90" style={{ background: C.panel2 }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: `${C.primary}22`, color: C.primary }}>
                  {item.kind === "trophy" ? <Trophy size={12} /> : item.kind === "team" ? <Users size={12} /> : item.kind === "lab" ? <Bug size={12} /> : item.kind === "message" ? <Hash size={12} /> : <MessageSquare size={12} />}
                </span>
                <p className="text-xs truncate flex-1" style={{ color: C.text, fontFamily: BODY_FONT }}>{item.text}</p>
                <span className="text-[10px] shrink-0" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(item.createdAt)}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>

      {editing && (
        <Panel className="p-4">
          <Field label="Bio (160 caractères max)">
            <textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 160))} rows={2} placeholder="Une courte présentation, ta spécialité, tes objectifs..." className="w-full px-3 py-2 rounded-md text-sm resize-none" style={inputStyle} />
            <span className="block mt-1 text-xs text-right" style={{ color: C.muted, fontFamily: MONO_FONT }}>{bio.length}/160</span>
          </Field>
          <Field label="Photo de profil">
            <div className="flex flex-wrap gap-2 mb-2">
              {AVATAR_OPTIONS.map((a) => {
                const Icon = a.icon;
                const active = avatarKey === a.key && !avatarImage;
                return (
                  <button key={a.key} onClick={() => { setAvatarKey(a.key); setAvatarImage(""); }} className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: a.color, outline: active ? `2px solid ${C.text}` : "none", outlineOffset: 2 }}>
                    <Icon size={18} color="#fff" />
                  </button>
                );
              })}
            </div>
            {currentUser.isPremium ? (
              <input value={avatarImage} onChange={(e) => setAvatarImage(e.target.value)} placeholder="Photo ou GIF animé — colle une URL d'image..."
                className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} />
            ) : (
              <button onClick={() => setTab("boutique")} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-left" style={{ background: `${C.gold}0F`, border: `1px solid ${C.gold}44`, color: C.muted, fontFamily: BODY_FONT }}>
                <Lock size={13} color={C.gold} /> Photo de profil animée (GIF) réservée au Pack VIP — <span style={{ color: C.gold }}>voir la boutique</span>
              </button>
            )}
          </Field>
          <Field label="Bannière">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <label className="relative w-20 h-11 rounded-md flex items-center justify-center cursor-pointer overflow-hidden"
                style={{ background: bannerColor ? `linear-gradient(135deg, ${bannerColor}, ${shadeColor(bannerColor, -35)})` : BANNER_MAP.indigo, outline: `2px solid ${C.text}`, outlineOffset: 2 }}
                title="Choisir ma propre couleur">
                <span className="text-[10px] font-semibold" style={{ color: "#fff", fontFamily: MONO_FONT }}>Pipette</span>
                <input type="color" value={bannerColor || "#5B6EF5"} onChange={(e) => { setBannerColor(e.target.value); setBannerImage(""); }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </label>
            </div>
            {currentUser.isPremium ? (
              <input value={bannerImage} onChange={(e) => { setBannerImage(e.target.value); setBannerColor(""); }} placeholder="Bannière ou GIF animé — colle une URL d'image..."
                className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} />
            ) : (
              <button onClick={() => setTab("boutique")} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs text-left" style={{ background: `${C.gold}0F`, border: `1px solid ${C.gold}44`, color: C.muted, fontFamily: BODY_FONT }}>
                <Lock size={13} color={C.gold} /> Bannière personnalisée (GIF) réservée au Pack VIP — <span style={{ color: C.gold }}>voir la boutique</span>
              </button>
            )}
          </Field>
          <Field label="GitHub">
            <div className="flex items-center gap-2">
              <GitHubIcon size={15} style={{ color: C.muted }} />
              <input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="pseudo ou lien github.com/..." className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} />
            </div>
          </Field>
          <Field label="Twitter / X">
            <div className="flex items-center gap-2">
              <XIcon size={15} style={{ color: C.muted }} />
              <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@pseudo ou lien" className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} />
            </div>
          </Field>
          <Field label="Discord">
            <div className="flex items-center gap-2">
              <MessageCircle size={15} style={{ color: C.muted }} />
              <input value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="pseudo#0000 ou pseudo" className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} />
            </div>
          </Field>
          <PrimaryButton onClick={save}><CheckCircle2 size={14} /> Enregistrer</PrimaryButton>
        </Panel>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Bandeau d'actus (défilement auto, sans images)
--------------------------------------------------------------------- */
function NewsMarquee({ news }) {
  if (news.length === 0) return null;
  const loop = [...news, ...news];
  return (
    <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${C.line}` }}>
      <style>{`
        @keyframes gowl-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .gowl-marquee-track { animation: gowl-marquee 40s linear infinite; }
        .gowl-marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="flex gowl-marquee-track" style={{ width: "max-content" }}>
        {loop.map((n, i) => {
          const cat = NEWS_CATEGORIES.find((c) => c.key === n.category) || NEWS_CATEGORIES[3];
          return (
            <div key={`${n.id}-${i}`} className="flex items-center gap-3 px-4 py-2.5 shrink-0" style={{ width: 340, borderRight: `1px solid ${C.line}`, background: C.panel }}>
              <div className="w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: `${cat.color}1A`, color: cat.color }}>
                <Newspaper size={15} />
              </div>
              <div className="min-w-0">
                <Chip label={cat.label} color={cat.color} />
                <p className="text-xs mt-1 truncate" style={{ color: C.text, fontFamily: BODY_FONT }}>{n.title}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   News
--------------------------------------------------------------------- */
function NewsCard({ item, isAdmin, onDelete }) {
  const cat = NEWS_CATEGORIES.find((c) => c.key === item.category) || NEWS_CATEGORIES[3];
  return (
    <Panel className="overflow-hidden flex flex-col h-full" style={{ borderColor: `${cat.color}40` }}>
      <div className="h-1.5" style={{ background: cat.color }} />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>{item.ref}</span>
          {isAdmin && <button onClick={() => onDelete(item.id)} style={{ color: C.alert }}><Trash2 size={13} /></button>}
        </div>
        <Chip label={cat.label} color={cat.color} />
        <h3 className="text-sm font-semibold mt-2.5 mb-1.5 leading-snug" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{item.title}</h3>
        <p className="text-sm flex-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>{item.summary}</p>
        <div className="mt-3 pt-2.5 flex items-center justify-between" style={{ borderTop: `1px solid ${C.line}` }}>
          <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>{item.source} · {timeAgo(item.date)}</span>
          {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs" style={{ color: C.primary, fontFamily: BODY_FONT }}>Lire <ExternalLink size={11} /></a>}
        </div>
      </div>
    </Panel>
  );
}

function NewsTab({ news, setNews, isAdmin, profiles = [], notifications = [], setNotifications, full }) {
  const [filter, setFilter] = useState("Tous");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState(NEWS_CATEGORIES[0].key);
  const [source, setSource] = useState("");
  const [url, setUrl] = useState("");
  const [recipient, setRecipient] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;
    const now = new Date().toISOString();
    const n = { id: uid(), ref: `HZ-2026-${String(200 + news.length).slice(-3)}`, category, title: title.trim(), summary: summary.trim(), source: source.trim() || "Équipe GowlSec", url: url.trim(), date: now };
    const next = [n, ...news];
    setNews(next);
    saveCollection("gowlsec:news", next);

    if (setNotifications) {
      const targetProfile = recipient ? profiles.find((p) => p.username === recipient) : null;
      const notif = {
        id: uid(),
        targetUserId: targetProfile ? targetProfile.id : null,
        targetUsername: targetProfile ? targetProfile.username : null,
        category,
        title: n.title,
        message: n.summary,
        createdAt: now,
      };
      const nextNotifs = [notif, ...notifications];
      setNotifications(nextNotifs);
      saveCollection("gowlsec:notifications", nextNotifs);
    }

    setTitle(""); setSummary(""); setSource(""); setUrl(""); setCategory(NEWS_CATEGORIES[0].key); setRecipient(""); setShowForm(false);
  }
  async function removeNews(id) {
    const next = news.filter((n) => n.id !== id);
    setNews(next);
    saveCollection("gowlsec:news", next);
  }
  const filtered = filter === "Tous" ? news : news.filter((n) => n.category === filter);
  const shown = full ? filtered : filtered.slice(0, 6);

  return (
    <div>
      {full && (
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Actualités & annonces</h2>
            <p className="text-sm mt-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>Nouveautés du site, annonces de l'équipe, félicitations et événements à venir.</p>
          </div>
          {isAdmin && <PrimaryButton onClick={() => setShowForm((s) => !s)}>{showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? "Annuler" : "Publier"}</PrimaryButton>}
        </div>
      )}
      {full && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {["Tous", ...NEWS_CATEGORIES.map((c) => c.key)].map((k) => {
            const c = NEWS_CATEGORIES.find((x) => x.key === k);
            const active = filter === k;
            return (
              <button key={k} onClick={() => setFilter(k)} className="text-xs px-3 py-1.5 rounded-md flex items-center gap-1.5"
                style={{ background: active ? (c ? c.color : C.primary) : "transparent", color: active ? "#0A0C10" : C.muted, border: `1px solid ${active ? "transparent" : C.line}`, fontFamily: MONO_FONT }}>
                {c?.icon && <c.icon size={12} />} {k === "Tous" ? "Tous" : c.label}
              </button>
            );
          })}
        </div>
      )}
      {showForm && (
        <Panel className="p-4 mb-6">
          <form onSubmit={submit}>
            <Field label="Type d'annonce">
              <div className="flex flex-wrap gap-2">
                {NEWS_CATEGORIES.map((c) => (
                  <button type="button" key={c.key} onClick={() => setCategory(c.key)} style={{ opacity: category === c.key ? 1 : 0.5 }}><Chip label={c.label} color={c.color} /></button>
                ))}
              </div>
            </Field>
            <Field label="Titre"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Nouvelle fonctionnalité, bravo à..., CTF ce week-end..." className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} /></Field>
            <Field label="Message"><textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-md text-sm resize-none" style={inputStyle} /></Field>
            <Field label="Destinataire de la notification">
              <select value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle}>
                <option value="">Tout le monde (diffusion générale)</option>
                {profiles.map((p) => <option key={p.id} value={p.username}>{p.username}</option>)}
              </select>
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Signature (optionnel)"><input value={source} onChange={(e) => setSource(e.target.value)} placeholder="ex : Équipe GowlSec" className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} /></Field>
              <Field label="Lien (optionnel)"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} /></Field>
            </div>
            <PrimaryButton type="submit"><CheckCircle2 size={14} /> Publier</PrimaryButton>
          </form>
        </Panel>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.length === 0 && <EmptyState text="Aucune actualité pour l'instant." />}
        {shown.map((n) => <NewsCard key={n.id} item={n} isAdmin={isAdmin} onDelete={removeNews} />)}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Forum — question / accompagnement
--------------------------------------------------------------------- */
function ForumTab({ pseudo, questions, setQuestions, isAdmin, lang = "fr", currentUser = null }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState(QUESTION_TYPES[3].key);
  const [openId, setOpenId] = useState(null);
  const [replyDraft, setReplyDraft] = useState({});

  async function submitQuestion(e) {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !body.trim()) return;
    const q = { id: uid(), author: pseudo, title: title.trim(), body: body.trim(), type, createdAt: new Date().toISOString(), answers: [], views: 0, resolved: false };
    const next = [q, ...questions];
    setQuestions(next);
    saveCollection("gowlsec:questions", next);
    setTitle(""); setBody(""); setType(QUESTION_TYPES[3].key); setShowForm(false);
    setOpenId(q.id);
  }
  async function toggleQuestion(qid) {
    if (openId === qid) {
      setOpenId(null);
      return;
    }
    const next = questions.map((q) => q.id === qid ? { ...q, views: (q.views || 0) + 1 } : q);
    setQuestions(next);
    saveCollection("gowlsec:questions", next);
    setOpenId(qid);
  }
  async function toggleResolved(qid) {
    const next = questions.map((q) => q.id === qid ? { ...q, resolved: !q.resolved } : q);
    setQuestions(next);
    saveCollection("gowlsec:questions", next);
  }
  async function addAnswer(qid) {
    if (!currentUser) { window.dispatchEvent(new CustomEvent("open-auth-login")); return; }
    const text = (replyDraft[qid] || "").trim();
    if (!text) return;
    const next = questions.map((q) => q.id === qid ? { ...q, answers: [...q.answers, { id: uid(), author: pseudo, body: text, createdAt: new Date().toISOString() }] } : q);
    setQuestions(next);
    saveCollection("gowlsec:questions", next);
    setReplyDraft((d) => ({ ...d, [qid]: "" }));
  }
  async function removeQuestion(qid) {
    const next = questions.filter((q) => q.id !== qid);
    setQuestions(next);
    saveCollection("gowlsec:questions", next);
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <SectionHeader icon={<MessageSquare size={19} />} eyebrow="Salon d'entraide" title={t(lang, "forumTitle")} subtitle={t(lang, "forumSub")} accent={C.primary} />
            {!currentUser ? (
              <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent("open-auth-login"))}>Connexion</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setShowForm((s) => !s)}>{showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? t(lang, "cancel") : t(lang, "newQuestion")}</PrimaryButton>
            )}
          </div>
          {!currentUser && (
            <GuestGate text="Connecte-toi pour poser des questions, répondre et participer à la communauté." accent={C.primary} />
          )}
          {showForm && (
            <ModalOverlay onClose={() => setShowForm(false)}>
              <CreationHero scene={<ForumScene />} accent={C.primary} eyebrow={t(lang, "forumHeroEyebrow")}
                title={t(lang, "forumHeroTitle")}
                subtitle={t(lang, "forumHeroSub")}
                onClose={() => setShowForm(false)}>
                <form onSubmit={submitQuestion} className="space-y-2.5">
                  <Field label="Type de demande">
                    <div className="flex flex-wrap gap-2">
                      {QUESTION_TYPES.map((t2) => (
                        <button type="button" key={t2.key} onClick={() => setType(t2.key)} style={{ opacity: type === t2.key ? 1 : 0.5 }}><Chip label={t2.label} color={t2.color} /></button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Titre"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Blocage sur l'escalade de privilèges (Linux)" className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
                  <Field label="Détails"><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Contexte, ce que tu as déjà essayé, où tu bloques..." className="w-full px-2.5 py-1.75 rounded-md text-sm resize-none" style={inputStyle} /></Field>
                  <PrimaryButton type="submit" className="!py-2"><Send size={14} /> {t(lang, "publish")}</PrimaryButton>
                </form>
              </CreationHero>
            </ModalOverlay>
          )}
          <div className="space-y-3">
            {questions.length === 0 && <EmptyState icon={<MessageSquare size={20} />} accent={C.primary} text="Aucune question pour l'instant. Sois le premier à demander de l'aide à la communauté." cta="Poser une question" onCta={() => setShowForm(true)} />}
            {questions.map((q) => {
              const qt = QUESTION_TYPES.find((t) => t.key === q.type) || QUESTION_TYPES[3];
              const open = openId === q.id;
              return (
                <Panel key={q.id} className="p-4 gowl-hud-card gowl-glass" style={{ "--gowl-accent": qt.color, borderLeft: `3px solid ${qt.color}88` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 cursor-pointer" onClick={() => toggleQuestion(q.id)}>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <Chip label={qt.label} color={qt.color} />
                        <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>{q.author} · {timeAgo(q.createdAt)}</span>
                      </div>
                      <h3 className="font-semibold text-sm mb-1" style={{ color: C.text, fontFamily: BODY_FONT }}>{q.title}</h3>
                      {!open && <p className="text-sm line-clamp-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>{q.body}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs flex items-center gap-1" style={{ color: C.muted, fontFamily: MONO_FONT }}><Eye size={12} /> {q.views || 0}</span>
                      <span className="text-xs flex items-center gap-1" style={{ color: C.muted, fontFamily: MONO_FONT }}><MessageSquare size={12} /> {q.answers.length}</span>
                      {q.author === pseudo && (
                        <button onClick={(e) => { e.stopPropagation(); toggleResolved(q.id); }} className="text-xs px-2 py-1 rounded-full" style={{ background: q.resolved ? `${C.ok}22` : "transparent", border: `1px solid ${q.resolved ? C.ok : C.line}`, color: q.resolved ? C.ok : C.muted, fontFamily: MONO_FONT }}>
                          {q.resolved ? "Résolue" : "Marquer résolue"}
                        </button>
                      )}
                      {(isAdmin || q.author === pseudo) && (
                        <GhostButton danger onClick={(e) => { e.stopPropagation(); removeQuestion(q.id); }}><Trash2 size={12} /></GhostButton>
                      )}
                      <button onClick={() => toggleQuestion(q.id)} style={{ color: C.muted }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
                    </div>
                  </div>
                  {open && (
                    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
                      <p className="text-sm mb-3 whitespace-pre-wrap" style={{ color: C.text, fontFamily: BODY_FONT }}>{q.body}</p>
                      <div className="space-y-2 mb-3">
                        {q.answers.map((a) => (
                          <div key={a.id} className="pl-3" style={{ borderLeft: `2px solid ${C.primary}55` }}>
                            <div className="text-xs mb-0.5" style={{ color: C.primary, fontFamily: MONO_FONT }}>{a.author} <span style={{ color: C.muted }}>· {timeAgo(a.createdAt)}</span></div>
                            <p className="text-sm" style={{ color: C.text, fontFamily: BODY_FONT }}>{a.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={replyDraft[q.id] || ""} onChange={(e) => setReplyDraft((d) => ({ ...d, [q.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && addAnswer(q.id)}
                          onFocus={() => { if (!currentUser) window.dispatchEvent(new CustomEvent("open-auth-login")); }}
                          placeholder={currentUser ? "Répondre..." : "Connecte-toi pour répondre..."} className="flex-1 px-3 py-1.5 rounded-md text-sm" style={inputStyle} />
                        <GhostButton onClick={() => addAnswer(q.id)}><Send size={12} /> Répondre</GhostButton>
                      </div>
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>
        </div>
        <InfoSidebar>
          <StatCardsRow vertical items={[
            { icon: <Flag size={13} />, label: "Questions", value: questions.length, accent: C.primary },
            { icon: <MessageSquare size={13} />, label: "Réponses données", value: questions.reduce((s, q) => s + q.answers.length, 0), accent: C.ok },
            { icon: <CheckCircle2 size={13} />, label: "Résolues", value: questions.filter((q) => q.resolved).length, accent: C.gold },
          ]} />
        </InfoSidebar>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Hub (multi-rooms) — discussion en direct + réactions
--------------------------------------------------------------------- */
const REACTION_EMOJIS = ["👍", "🔥", "💀", "🐛", "😂"];

function RoomsTab({ pseudo, messages, setMessages, isAdmin, lang = "fr", profiles = [], currentUser = null }) {
  const [room, setRoom] = useState("general");
  const [text, setText] = useState("");
  const [rooms, setRooms] = useState(DEFAULT_ROOMS);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomType, setNewRoomType] = useState("public");
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [banUsername, setBanUsername] = useState("");
  const [banFeedback, setBanFeedback] = useState("");
  const [transferUsername, setTransferUsername] = useState("");
  const [roomActionFeedback, setRoomActionFeedback] = useState("");
  const [roomJoinPassword, setRoomJoinPassword] = useState({});
  const [roomJoinError, setRoomJoinError] = useState("");
  const [roomAccess, setRoomAccess] = useState({ general: true });
  const bottomRef = useRef(null);
  const roomMessages = messages.filter((m) => (m.room || "general") === room);
  const current = rooms.find((r) => r.key === room) || rooms[0] || DEFAULT_ROOMS[0];
  const isOwner = current.owner === pseudo;
  const isBanned = (current.bannedUsers || []).includes(pseudo);
  const accessLocked = current.isPublic === false && !isOwner && !isAdmin && !roomAccess[current.key] && current.key !== "general";
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [roomMessages.length, room]);
  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await loadCollection("gowlsec:rooms", DEFAULT_ROOMS);
      if (!active) return;
      const normalized = (Array.isArray(saved) && saved.length > 0 ? saved : DEFAULT_ROOMS).map((room) => ({
        ...room,
        owner: room.owner || "system",
        passwordHash: room.passwordHash || null,
        bannedUsers: Array.isArray(room.bannedUsers) ? room.bannedUsers : [],
      }));
      setRooms(normalized);
      setRoomAccess((prev) => ({ ...prev, general: true, ...Object.fromEntries(normalized.filter((r) => r.isPublic !== false).map((r) => [r.key, true])) }));
      if (!Array.isArray(saved) || saved.length === 0) saveCollection("gowlsec:rooms", normalized);
    })();
    return () => { active = false; };
  }, []);

  async function send() {
    if (!currentUser) return;
    if (!text.trim()) return;
    const activeRoom = rooms.find((r) => r.key === room) || rooms[0] || DEFAULT_ROOMS[0];
    if ((activeRoom.bannedUsers || []).includes(pseudo)) return;
    if (activeRoom.isPublic === false && !isOwner && !isAdmin && !roomAccess[activeRoom.key] && activeRoom.key !== "general") return;
    const m = { id: uid(), room, author: pseudo, text: text.trim(), createdAt: new Date().toISOString(), reactions: {} };
    const next = [...messages, m];
    setMessages(next);
    saveCollection("gowlsec:chat", next);
    setText("");
  }
  async function removeMsg(id) {
    const next = messages.filter((m) => m.id !== id);
    setMessages(next);
    saveCollection("gowlsec:chat", next);
  }
  async function toggleReaction(id, emoji) {
    const next = messages.map((m) => {
      if (m.id !== id) return m;
      const reactions = { ...(m.reactions || {}) };
      const users = reactions[emoji] || [];
      reactions[emoji] = users.includes(pseudo) ? users.filter((u) => u !== pseudo) : [...users, pseudo];
      if (reactions[emoji].length === 0) delete reactions[emoji];
      return { ...m, reactions };
    });
    setMessages(next);
    saveCollection("gowlsec:chat", next);
  }

  async function createRoom(e) {
    e.preventDefault();
    const name = newRoomName.trim();
    if (!name) return;
    if (newRoomType === "private" && !newRoomPassword.trim()) return;
    const base = name.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "salon";
    let slug = base;
    let counter = 2;
    while (rooms.some((r) => r.key === slug)) {
      slug = `${base}-${counter}`;
      counter += 1;
    }
    const passwordHash = newRoomType === "private" ? await hashText(newRoomPassword.trim()) : null;
    const nextRooms = [...rooms, { key: slug, label: name.trim(), desc: newRoomType === "public" ? "Salon public" : "Salon privé", isPublic: newRoomType === "public", owner: pseudo, bannedUsers: [], passwordHash }];
    setRooms(nextRooms);
    saveCollection("gowlsec:rooms", nextRooms);
    setRoom(slug);
    setRoomAccess((prev) => ({ ...prev, [slug]: newRoomType === "public" || newRoomType === "private" && pseudo === pseudo }));
    setNewRoomName("");
    setNewRoomPassword("");
    setNewRoomType("public");
  }

  async function openRoom(targetRoom) {
    if (targetRoom.key === room) return;
    if (targetRoom.isPublic !== false || targetRoom.owner === pseudo || isAdmin || roomAccess[targetRoom.key]) {
      setRoom(targetRoom.key);
      setRoomJoinError("");
      return;
    }
    const attempt = (roomJoinPassword[targetRoom.key] || "").trim();
    if (!attempt) {
      setRoomJoinError("Mot de passe requis pour rejoindre ce salon privé.");
      return;
    }
    const hash = await hashText(attempt);
    if (hash !== targetRoom.passwordHash) {
      setRoomJoinError("Mot de passe incorrect.");
      setRoomJoinPassword((prev) => ({ ...prev, [targetRoom.key]: "" }));
      return;
    }
    setRoomAccess((prev) => ({ ...prev, [targetRoom.key]: true }));
    setRoomJoinPassword((prev) => ({ ...prev, [targetRoom.key]: attempt }));
    setRoomJoinError("");
    setRoom(targetRoom.key);
  }

  async function banUser(e) {
    e.preventDefault();
    const target = banUsername.trim();
    if (!target || !isOwner) return;
    const targetRoom = rooms.find((r) => r.key === room) || rooms[0] || DEFAULT_ROOMS[0];
    if ((targetRoom.bannedUsers || []).includes(target)) {
      setBanFeedback(`"${target}" est déjà banni.`);
      return;
    }
    const nextRooms = rooms.map((r) => r.key === room ? { ...r, bannedUsers: [...(r.bannedUsers || []), target] } : r);
    setRooms(nextRooms);
    saveCollection("gowlsec:rooms", nextRooms);
    setBanUsername("");
    setBanFeedback(`"${target}" a été banni du salon.`);
  }

  async function transferRoomOwner() {
    if (!isOwner) return;
    const target = transferUsername.trim();
    if (!target || target === pseudo) {
      setRoomActionFeedback("Choisis un autre pseudo pour transférer la propriété.");
      return;
    }
    const knownUsernames = (profiles || []).map((profile) => profile.username).filter(Boolean);
    if (knownUsernames.length > 0 && !knownUsernames.includes(target)) {
      setRoomActionFeedback("Ce pseudo n'est pas reconnu dans la communauté.");
      return;
    }
    const nextRooms = rooms.map((r) => r.key === room ? { ...r, owner: target } : r);
    setRooms(nextRooms);
    saveCollection("gowlsec:rooms", nextRooms);
    setTransferUsername("");
    setRoomActionFeedback(`La propriété a été transférée à "${target}".`);
  }

  async function deleteRoom() {
    if (!isOwner) return;
    const targetRoom = rooms.find((r) => r.key === room) || rooms[0] || DEFAULT_ROOMS[0];
    const nextRooms = rooms.filter((r) => r.key !== targetRoom.key);
    if (nextRooms.length === 0) {
      setRooms(DEFAULT_ROOMS.map((r) => ({ ...r, owner: r.owner || "system", bannedUsers: [] })));
      saveCollection("gowlsec:rooms", DEFAULT_ROOMS.map((r) => ({ ...r, owner: r.owner || "system", bannedUsers: [] })));
      setRoom("general");
      setMessages(messages.filter((m) => m.room !== targetRoom.key));
      saveCollection("gowlsec:chat", messages.filter((m) => m.room !== targetRoom.key));
      setRoomActionFeedback("Le salon a été supprimé.");
      return;
    }
    setRooms(nextRooms);
    saveCollection("gowlsec:rooms", nextRooms);
    setMessages(messages.filter((m) => m.room !== targetRoom.key));
    saveCollection("gowlsec:chat", messages.filter((m) => m.room !== targetRoom.key));
    setRoom(nextRooms[0].key);
    setRoomActionFeedback(`Le salon "${targetRoom.label}" a été supprimé.`);
  }

  return (
    <div>
      <Panel className="overflow-hidden mb-6" style={{ border: `1px solid ${C.line}`, background: "rgba(255,255,255,0.02)" }}>
        <div className="grid md:grid-cols-[0.92fr_1.3fr]">
          <div className="relative flex flex-col justify-center px-6 pt-6 pb-5" style={{ background: "rgba(255,255,255,0.03)", borderRight: `1px solid ${C.line}` }}>
            <HubScene />
            <span className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: C.ok, fontFamily: MONO_FONT }}>{t(lang, "hubHeroEyebrow")}</span>
            <h3 className="text-lg font-bold mb-1.5 leading-tight" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{t(lang, "hubHeroTitle")}</h3>
            <p className="text-xs leading-relaxed" style={{ color: C.muted, fontFamily: BODY_FONT }}>{t(lang, "hubHeroSub")}</p>
          </div>
          <div className="p-5">
            <form onSubmit={createRoom} className="rounded-lg border p-3 mb-3" style={{ background: "rgba(255,255,255,0.03)", borderColor: C.line }}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: C.muted, fontFamily: MONO_FONT }}>Nom du salon</label>
                  <input value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="Ex. CTF juniors" className="w-full px-3 py-2 rounded-md text-sm" style={{ ...inputStyle, background: "rgba(5,10,16,0.75)", border: `1px solid ${C.line}` }} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setNewRoomType("public")} className="px-3 py-2 rounded-md text-sm" style={{ background: newRoomType === "public" ? C.primary : "transparent", color: newRoomType === "public" ? "#fff" : C.muted, border: `1px solid ${newRoomType === "public" ? C.primary : C.line}` }}><Globe size={14} className="inline mr-1.5" />Public</button>
                  <button type="button" onClick={() => setNewRoomType("private")} className="px-3 py-2 rounded-md text-sm" style={{ background: newRoomType === "private" ? C.warn : "transparent", color: newRoomType === "private" ? "#fff" : C.muted, border: `1px solid ${newRoomType === "private" ? C.warn : C.line}` }}><KeyRound size={14} className="inline mr-1.5" />Privé</button>
                </div>
                <PrimaryButton type="submit">Créer</PrimaryButton>
              </div>
              {newRoomType === "private" && (
                <div className="mt-2">
                  <label className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: C.muted, fontFamily: MONO_FONT }}>Mot de passe du salon</label>
                  <input type="password" value={newRoomPassword} onChange={(e) => setNewRoomPassword(e.target.value)} placeholder="Définis un mot de passe" className="w-full px-3 py-2 rounded-md text-sm" style={{ ...inputStyle, background: "rgba(5,10,16,0.75)", border: `1px solid ${C.line}` }} />
                </div>
              )}
            </form>
          </div>
        </div>
      </Panel>
      <div className="grid md:grid-cols-[220px_1fr] gap-4">
        <Panel className="p-2 h-fit md:sticky md:top-20" style={{ borderColor: C.line, background: "rgba(255,255,255,0.02)" }}>
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {rooms.map((r) => {
              const active = r.key === room;
              return (
                <button key={r.key} onClick={() => openRoom(r)} className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left whitespace-nowrap transition-all"
                  style={{ background: active ? "rgba(255,255,255,0.08)" : "transparent", color: active ? C.text : C.muted, fontFamily: BODY_FONT, fontWeight: active ? 700 : 500 }}>
                  {r.isPublic === false ? <KeyRound size={13} /> : <Globe size={13} />} {r.label}
                </button>
              );
            })}
          </div>
        </Panel>
        <Panel className="flex flex-col overflow-hidden" style={{ height: 480, borderColor: C.line, background: "rgba(255,255,255,0.02)" }}>
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${C.line}`, background: "rgba(255,255,255,0.03)" }}>
            <Activity size={14} style={{ color: C.primary }} className="ml-1" />
            <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>#{current.label} · {current.desc}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ background: "rgba(255,255,255,0.02)" }}>
            {isOwner && (
              <div className="rounded-xl border p-3 mb-3" style={{ borderColor: C.line, background: "rgba(255,255,255,0.03)" }}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="block text-[11px] uppercase tracking-wide mb-1" style={{ color: C.muted, fontFamily: MONO_FONT }}>Transférer la propriété</label>
                    <input value={transferUsername} onChange={(e) => setTransferUsername(e.target.value)} placeholder="Nom d'utilisateur" className="w-full px-3 py-2 rounded-md text-sm" style={{ ...inputStyle, background: "rgba(5,10,16,0.75)", border: `1px solid ${C.line}` }} />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={transferRoomOwner} className="px-3 py-2 rounded-md text-sm" style={{ background: C.primary, color: "#fff", fontFamily: BODY_FONT }}>Transférer</button>
                    <button type="button" onClick={deleteRoom} className="px-3 py-2 rounded-md text-sm" style={{ background: C.alert, color: "#fff", fontFamily: BODY_FONT }}>Supprimer</button>
                  </div>
                </div>
                {roomActionFeedback && <p className="text-xs mt-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>{roomActionFeedback}</p>}
              </div>
            )}
            {accessLocked ? (
              <div className="rounded-xl border p-4" style={{ borderColor: C.line, background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-2 mb-2">
                  <KeyRound size={14} style={{ color: C.warn }} />
                  <span className="text-sm font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>Salon privé</span>
                </div>
                <p className="text-sm mb-3" style={{ color: C.muted, fontFamily: BODY_FONT }}>Ce salon est protégé par un mot de passe. Entrez-le pour rejoindre la discussion.</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="password" value={roomJoinPassword[current.key] || ""} onChange={(e) => setRoomJoinPassword((prev) => ({ ...prev, [current.key]: e.target.value }))} placeholder="Mot de passe du salon" className="flex-1 px-3 py-2 rounded-md text-sm" style={{ ...inputStyle, background: "rgba(5,10,16,0.75)", border: `1px solid ${C.line}` }} />
                  <button type="button" onClick={() => openRoom(current)} className="px-3 py-2 rounded-md text-sm" style={{ background: C.primary, color: "#fff", fontFamily: BODY_FONT }}>Rejoindre</button>
                </div>
                {roomJoinError && <p className="text-xs mt-2" style={{ color: C.alert, fontFamily: BODY_FONT }}>{roomJoinError}</p>}
              </div>
            ) : (
              <>
                {roomMessages.length === 0 && <EmptyState text="Aucun message dans ce salon. Lance la discussion." />}
                {roomMessages.map((m) => {
              const reactions = m.reactions || {};
              return (
                <div key={m.id} className="flex items-start gap-2 group">
                  <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0" style={{ background: "rgba(255,255,255,0.06)", color: C.primary, border: `1px solid ${C.line}`, fontFamily: MONO_FONT }}>
                    {m.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: C.text, fontFamily: MONO_FONT }}>{m.author}</span>
                      <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(m.createdAt)}</span>
                      {isAdmin && <button onClick={() => removeMsg(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.alert }}><Trash2 size={11} /></button>}
                    </div>
                    <p className="text-sm mb-1.5" style={{ color: C.text, fontFamily: BODY_FONT }}>{m.text}</p>
                    <div className="flex items-center gap-1 flex-wrap opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      {REACTION_EMOJIS.map((em) => {
                        const users = reactions[em] || [];
                        const active = users.includes(pseudo);
                        if (users.length === 0 && !active) {
                          return (
                            <button key={em} onClick={() => toggleReaction(m.id, em)} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "transparent", border: `1px solid ${C.line}`, opacity: 0.6 }}>{em}</button>
                          );
                        }
                        return null;
                      })}
                    </div>
                    {Object.keys(reactions).length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mt-1">
                        {Object.entries(reactions).map(([em, users]) => (
                          <button key={em} onClick={() => toggleReaction(m.id, em)} className="text-xs px-1.5 py-0.5 rounded flex items-center gap-1" style={{ background: users.includes(pseudo) ? `${C.primary}22` : C.panel2, border: `1px solid ${users.includes(pseudo) ? C.primary : C.line}`, color: C.text, fontFamily: MONO_FONT }}>
                            {em} {users.length}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                );
                })}
                <div ref={bottomRef} />
              </>
            )}
          </div>
          <div className="p-3" style={{ borderTop: `1px solid ${C.line}` }}>
            {!currentUser && <GuestGate text="Connecte-toi pour écrire dans ce salon." accent={C.primary} />}
            {isOwner && (
              <form onSubmit={banUser} className="flex flex-col sm:flex-row gap-2 mb-3">
                <input value={banUsername} onChange={(e) => setBanUsername(e.target.value)} placeholder={`Bannir quelqu'un de #${current.label}`} className="flex-1 px-3 py-2 rounded-md text-sm" style={{ ...inputStyle, background: "rgba(5,10,16,0.75)", border: `1px solid ${C.line}` }} />
                <button type="submit" className="px-3 py-2 rounded-md text-sm" style={{ background: C.alert, color: "#fff", fontFamily: BODY_FONT }}>Bannir</button>
              </form>
            )}
            {banFeedback && <p className="text-xs mb-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>{banFeedback}</p>}
            {isBanned ? (
              <div className="rounded-xl p-3 text-sm" style={{ background: `${C.panel}CC`, border: `1px solid ${C.line}`, color: C.alert }}>
                Vous avez été banni de ce salon.
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl p-2" style={{ background: `${C.panel}CC`, border: `1px solid ${C.line}`, opacity: currentUser ? 1 : 0.6 }}>
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
                  onFocus={() => { if (!currentUser) window.dispatchEvent(new CustomEvent("open-auth-login")); }}
                  disabled={!currentUser} readOnly={!currentUser}
                  placeholder={currentUser ? `Écrire dans #${current.label}...` : "Connecte-toi pour écrire..."} className="flex-1 px-3 py-2 rounded-md text-sm disabled:cursor-not-allowed" style={{ ...inputStyle, background: "transparent", border: "none", boxShadow: "none" }} />
                <PrimaryButton onClick={() => currentUser ? send() : window.dispatchEvent(new CustomEvent("open-auth-login"))}><Send size={14} /></PrimaryButton>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Team — création de teams (max 16, publique ou privée) + annonces
--------------------------------------------------------------------- */
function TeamsTab({ pseudo, teams, setTeams, announcements, setAnnouncements, isAdmin, lang = "fr", currentUser = null }) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logoType, setLogoType] = useState("emoji");
  const [logoValue, setLogoValue] = useState(TEAM_EMOJIS[0]);
  const [visibility, setVisibility] = useState("public");
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState("");
  const [joinPwd, setJoinPwd] = useState({});
  const [joinError, setJoinError] = useState({});

  async function createTeam(e) {
    e.preventDefault();
    if (!currentUser) return;
    if (!name.trim()) return;
    if (visibility === "private" && !password.trim()) return;
    const passwordHash = visibility === "private" ? await hashText(password.trim()) : null;
    const t = {
      id: uid(), name: name.trim(), description: description.trim(),
      logoType, logoValue: logoType === "emoji" ? logoValue : logoValue.trim(),
      owner: pseudo, members: [pseudo], maxMembers: TEAM_MAX_MEMBERS,
      visibility, passwordHash, createdAt: new Date().toISOString(),
    };
    const next = [t, ...teams];
    setTeams(next);
    await saveCollection("gowlsec:teams", next);
    setName(""); setDescription(""); setLogoType("emoji"); setLogoValue(TEAM_EMOJIS[0]); setVisibility("public"); setPassword("");
    setShowCreate(false);
    setSelectedId(t.id);
  }
  async function joinTeam(team) {
    if (!currentUser) return;
    if (team.members.includes(pseudo)) return;
    if (team.members.length >= (team.maxMembers || TEAM_MAX_MEMBERS)) {
      setJoinError((e) => ({ ...e, [team.id]: `Équipe complète (${team.maxMembers || TEAM_MAX_MEMBERS} membres max).` }));
      return;
    }
    if (team.visibility === "private") {
      const attempt = (joinPwd[team.id] || "").trim();
      if (!attempt) { setJoinError((e) => ({ ...e, [team.id]: "Mot de passe requis." })); return; }
      const hash = await hashText(attempt);
      if (hash !== team.passwordHash) { setJoinError((e) => ({ ...e, [team.id]: "Mot de passe incorrect." })); return; }
    }
    const next = teams.map((t) => t.id === team.id ? { ...t, members: [...t.members, pseudo] } : t);
    setTeams(next);
    await saveCollection("gowlsec:teams", next);
    setJoinError((e) => ({ ...e, [team.id]: "" }));
    setJoinPwd((p) => ({ ...p, [team.id]: "" }));
  }
  async function leaveTeam(teamId) {
    const next = teams.map((t) => t.id === teamId ? { ...t, members: t.members.filter((m) => m !== pseudo) } : t);
    setTeams(next);
    await saveCollection("gowlsec:teams", next);
  }
  async function removeTeam(teamId) {
    const next = teams.filter((t) => t.id !== teamId);
    setTeams(next);
    await saveCollection("gowlsec:teams", next);
    const nextAnn = announcements.filter((a) => a.teamId !== teamId);
    setAnnouncements(nextAnn);
    await saveCollection("gowlsec:team_announcements", nextAnn);
    setSelectedId(null);
  }
  async function postAnnouncement(teamId) {
    if (!currentUser) return;
    const text = draft.trim();
    if (!text) return;
    const a = { id: uid(), teamId, author: pseudo, text, createdAt: new Date().toISOString() };
    const next = [a, ...announcements];
    setAnnouncements(next);
    await saveCollection("gowlsec:team_announcements", next);
    setDraft("");
  }
  async function removeAnnouncement(id) {
    const next = announcements.filter((a) => a.id !== id);
    setAnnouncements(next);
    await saveCollection("gowlsec:team_announcements", next);
  }

  const selected = teams.find((t) => t.id === selectedId);

  if (selected) {
    const isMember = selected.members.includes(pseudo);
    const isPrivate = selected.visibility === "private";
    const isFull = selected.members.length >= (selected.maxMembers || TEAM_MAX_MEMBERS);
    const teamAnnouncements = announcements.filter((a) => a.teamId === selected.id);
    return (
      <div>
        <GhostButton onClick={() => setSelectedId(null)}>← Retour aux équipes</GhostButton>
        <Panel className="p-4 mt-3">
          <div className="flex items-start gap-3 flex-wrap">
            <TeamLogo team={selected} size={44} />
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{selected.name}</h2>
                <Chip label={isPrivate ? "Privée" : "Publique"} color={isPrivate ? C.warn : C.ok} />
              </div>
              <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>{selected.description || "Aucune description."}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[11px] flex items-center gap-1" style={{ color: C.muted, fontFamily: MONO_FONT }}>
                  <Users size={11} /> {selected.members.length}/{selected.maxMembers || TEAM_MAX_MEMBERS} membres
                </span>
                <span className="text-[11px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>Capitaine : {selected.owner}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              {isMember ? (
                selected.owner !== pseudo && <GhostButton onClick={() => leaveTeam(selected.id)}>Quitter</GhostButton>
              ) : isFull ? (
                <span className="text-xs" style={{ color: C.alert, fontFamily: BODY_FONT }}>Équipe complète</span>
              ) : isPrivate ? (
                <div className="flex items-center gap-2">
                  <input type="password" value={joinPwd[selected.id] || ""} onChange={(e) => setJoinPwd((p) => ({ ...p, [selected.id]: e.target.value }))}
                    placeholder="mot de passe" className="px-2 py-1 rounded-md text-[11px] w-28" style={inputStyle} />
                  <PrimaryButton onClick={() => joinTeam(selected)}><KeyRound size={12} /> Rejoindre</PrimaryButton>
                </div>
              ) : (
                <PrimaryButton onClick={() => joinTeam(selected)}><Plus size={12} /> Rejoindre</PrimaryButton>
              )}
              {(isAdmin || selected.owner === pseudo) && <GhostButton danger onClick={() => removeTeam(selected.id)}><Trash2 size={12} /> Supprimer</GhostButton>}
            </div>
          </div>
          {joinError[selected.id] && <p className="text-[11px] mt-2 text-right" style={{ color: C.alert, fontFamily: BODY_FONT }}>{joinError[selected.id]}</p>}
        </Panel>

        <div className="mt-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: C.muted, fontFamily: MONO_FONT }}>Annonces</h3>
          {isMember && (
            <Panel className="p-2.5 mb-3">
              <div className="flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && postAnnouncement(selected.id)}
                  placeholder="Publier une annonce à l'équipe..." className="flex-1 px-2.5 py-1.5 rounded-md text-sm" style={inputStyle} />
                <PrimaryButton onClick={() => postAnnouncement(selected.id)}><Megaphone size={13} /></PrimaryButton>
              </div>
            </Panel>
          )}
          <div className="space-y-2">
            {teamAnnouncements.length === 0 && <EmptyState text="Aucune annonce pour cette équipe." />}
            {teamAnnouncements.map((a) => (
              <Panel key={a.id} className="p-2.5 flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] mb-1" style={{ color: C.primary, fontFamily: MONO_FONT }}>{a.author} · {timeAgo(a.createdAt)}</div>
                  <p className="text-xs" style={{ color: C.text, fontFamily: BODY_FONT }}>{a.text}</p>
                </div>
                {(isAdmin || a.author === pseudo || selected.owner === pseudo) && (
                  <button onClick={() => removeAnnouncement(a.id)} style={{ color: C.alert }} className="shrink-0"><Trash2 size={12} /></button>
                )}
              </Panel>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <SectionHeader icon={<Users size={19} />} eyebrow="Escouades" title={t(lang, "teamTitle")} subtitle={t(lang, "teamSub")} accent={C.warn} />
            {!currentUser ? (
              <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent("open-auth-login"))}>Connexion</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setShowCreate((s) => !s)}>{showCreate ? <X size={15} /> : <Plus size={15} />} {showCreate ? t(lang, "cancel") : t(lang, "newTeam")}</PrimaryButton>
            )}
          </div>
          {!currentUser && (
            <GuestGate text="Connecte-toi pour créer ou rejoindre une team." accent={C.warn} />
          )}
          {showCreate && (
            <ModalOverlay onClose={() => setShowCreate(false)}>
              <CreationHero scene={<TeamScene />} accent={C.warn} eyebrow={t(lang, "teamHeroEyebrow")}
                title={t(lang, "teamHeroTitle")}
                subtitle={t(lang, "teamHeroSub")}
                onClose={() => setShowCreate(false)}>
                <form onSubmit={createTeam} className="space-y-2.5">
                  <Field label="Nom de l'équipe"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Les Corbeaux Noirs" className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
                  <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Objectif de l'équipe, niveau, disponibilités..." className="w-full px-2.5 py-1.75 rounded-md text-sm resize-none" style={inputStyle} /></Field>
                  <Field label="Logo de l'équipe">
                    <div className="flex gap-1 mb-2 p-1 rounded-md w-fit" style={{ background: C.panel2 }}>
                      <button type="button" onClick={() => setLogoType("emoji")} className="text-xs px-2.5 py-1 rounded"
                        style={{ background: logoType === "emoji" ? C.primary : "transparent", color: logoType === "emoji" ? "#fff" : C.muted, fontFamily: BODY_FONT }}>Émoji</button>
                      <button type="button" onClick={() => { setLogoType("image"); setLogoValue(""); }} className="text-xs px-2.5 py-1 rounded"
                        style={{ background: logoType === "image" ? C.primary : "transparent", color: logoType === "image" ? "#fff" : C.muted, fontFamily: BODY_FONT }}>Logo perso (URL)</button>
                    </div>
                    {logoType === "emoji" ? (
                      <div className="flex flex-wrap gap-2">
                        {TEAM_EMOJIS.map((em) => (
                          <button type="button" key={em} onClick={() => setLogoValue(em)} className="w-8 h-8 rounded-md flex items-center justify-center text-base"
                            style={{ background: C.panel2, outline: logoValue === em ? `2px solid ${C.primary}` : `1px solid ${C.line}`, outlineOffset: 1 }}>{em}</button>
                        ))}
                      </div>
                    ) : (
                      <input value={logoValue} onChange={(e) => setLogoValue(e.target.value)} placeholder="https://..." className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} />
                    )}
                  </Field>
                  <Field label="Visibilité (16 membres max)">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setVisibility("public")} className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.75 rounded-md text-sm"
                        style={{ background: visibility === "public" ? C.primary : C.panel2, color: visibility === "public" ? "#fff" : C.muted, fontFamily: BODY_FONT }}>
                        <Globe size={14} /> Publique
                      </button>
                      <button type="button" onClick={() => setVisibility("private")} className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.75 rounded-md text-sm"
                        style={{ background: visibility === "private" ? C.primary : C.panel2, color: visibility === "private" ? "#fff" : C.muted, fontFamily: BODY_FONT }}>
                        <Lock size={14} /> Privée
                      </button>
                    </div>
                  </Field>
                  {visibility === "private" && (
                    <Field label="Mot de passe de l'équipe">
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Requis pour une équipe privée" className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} />
                    </Field>
                  )}
                  <PrimaryButton type="submit" className="!py-2"><CheckCircle2 size={14} /> Créer l'équipe</PrimaryButton>
                </form>
              </CreationHero>
            </ModalOverlay>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {teams.length === 0 && <EmptyState icon={<Users size={20} />} accent={C.warn} text="Aucune équipe pour l'instant. Sois le premier à en créer une." cta="Créer une équipe" onCta={() => setShowCreate(true)} />}
            {teams.map((t) => {
              const isPrivate = t.visibility === "private";
              const fillPct = Math.min(100, Math.round((t.members.length / (t.maxMembers || TEAM_MAX_MEMBERS)) * 100));
              return (
                <Panel key={t.id} className="p-3 pt-4 cursor-pointer gowl-hud-card gowl-glass relative overflow-hidden" style={{ "--gowl-accent": isPrivate ? C.warn : C.ok }} onClick={() => setSelectedId(t.id)}>
                  <div aria-hidden className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${isPrivate ? C.warn : C.ok}, transparent)` }} />
                  <div className="flex items-center gap-2.5 mb-2">
                    <TeamLogo team={t} size={32} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-semibold text-[13px] truncate" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{t.name}</h3>
                      </div>
                      <span className="text-[11px] flex items-center gap-1" style={{ color: C.muted, fontFamily: MONO_FONT }}>
                        <Users size={10} /> {t.members.length}/{t.maxMembers || TEAM_MAX_MEMBERS} membres
                      </span>
                    </div>
                    <Chip label={isPrivate ? "Privée" : "Publique"} color={isPrivate ? C.warn : C.ok} />
                  </div>
                  <div className="w-full rounded-full overflow-hidden mb-3" style={{ height: 4, background: C.panel2 }}>
                    <div className="gowl-bar-fill h-full rounded-full" style={{ width: `${fillPct}%`, background: `linear-gradient(90deg, ${isPrivate ? C.warn : C.ok}, ${isPrivate ? C.warn : C.ok}88)` }} />
                  </div>
                  <p className="text-[11px] line-clamp-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>{t.description || "Aucune description."}</p>
                  <div className="mt-2 pt-1.5 flex items-center justify-between" style={{ borderTop: `1px solid ${C.line}` }}>
                    <span className="text-[11px]" style={{ color: C.primary, fontFamily: MONO_FONT }}>Capitaine : {t.owner}</span>
                    <span className="text-[11px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(t.createdAt)}</span>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
        <InfoSidebar>
          <StatCardsRow vertical items={[
            { icon: <Users size={13} />, label: "Équipes actives", value: teams.length, accent: C.warn },
            { icon: <UserIcon size={13} />, label: "Membres cumulés", value: teams.reduce((s, tm) => s + tm.members.length, 0), accent: C.primary },
            { icon: <Unlock size={13} />, label: "Places libres", value: teams.reduce((s, tm) => s + Math.max(0, (tm.maxMembers || TEAM_MAX_MEMBERS) - tm.members.length), 0), accent: C.ok },
          ]} />
        </InfoSidebar>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Labs — salons de session pour HTB / TryHackMe / Root-Me (8 max)
--------------------------------------------------------------------- */
function LabsTab({ pseudo, labs, setLabs, labMessages, setLabMessages, isAdmin, lang = "fr", currentUser = null }) {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState(LAB_PLATFORMS[0].key);
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [password, setPassword] = useState("");
  const [joinPwd, setJoinPwd] = useState({});
  const [joinError, setJoinError] = useState({});
  const [chatText, setChatText] = useState("");
  const bottomRef = useRef(null);

  async function createLab(e) {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim()) return;
    if (visibility === "private" && !password.trim()) return;
    const passwordHash = visibility === "private" ? await hashText(password.trim()) : null;
    const lab = {
      id: uid(), title: title.trim(), platform, description: description.trim(),
      owner: pseudo, members: [pseudo], maxMembers: LAB_MAX_MEMBERS,
      visibility, passwordHash, createdAt: new Date().toISOString(),
    };
    const next = [lab, ...labs];
    setLabs(next);
    await saveCollection("gowlsec:labs", next);
    setTitle(""); setPlatform(LAB_PLATFORMS[0].key); setDescription(""); setVisibility("public"); setPassword("");
    setShowCreate(false);
    setSelectedId(lab.id);
  }
  async function joinLab(lab) {
    if (!currentUser) return;
    if (lab.members.includes(pseudo)) return;
    if (lab.members.length >= (lab.maxMembers || LAB_MAX_MEMBERS)) {
      setJoinError((e) => ({ ...e, [lab.id]: `Salon complet (${lab.maxMembers || LAB_MAX_MEMBERS} personnes max).` }));
      return;
    }
    if (lab.visibility === "private") {
      const attempt = (joinPwd[lab.id] || "").trim();
      if (!attempt) { setJoinError((e) => ({ ...e, [lab.id]: "Mot de passe requis." })); return; }
      const hash = await hashText(attempt);
      if (hash !== lab.passwordHash) { setJoinError((e) => ({ ...e, [lab.id]: "Mot de passe incorrect." })); return; }
    }
    const next = labs.map((l) => l.id === lab.id ? { ...l, members: [...l.members, pseudo] } : l);
    setLabs(next);
    await saveCollection("gowlsec:labs", next);
    setJoinError((e) => ({ ...e, [lab.id]: "" }));
    setJoinPwd((p) => ({ ...p, [lab.id]: "" }));
  }
  async function leaveLab(labId) {
    const next = labs.map((l) => l.id === labId ? { ...l, members: l.members.filter((m) => m !== pseudo) } : l);
    setLabs(next);
    await saveCollection("gowlsec:labs", next);
  }
  async function removeLab(labId) {
    const next = labs.filter((l) => l.id !== labId);
    setLabs(next);
    await saveCollection("gowlsec:labs", next);
    const nextMsgs = labMessages.filter((m) => m.labId !== labId);
    setLabMessages(nextMsgs);
    await saveCollection("gowlsec:lab_messages", nextMsgs);
    setSelectedId(null);
  }
  async function sendLabMessage(labId) {
    if (!currentUser) return;
    const text = chatText.trim();
    if (!text) return;
    const m = { id: uid(), labId, author: pseudo, text, createdAt: new Date().toISOString() };
    const next = [...labMessages, m];
    setLabMessages(next);
    await saveCollection("gowlsec:lab_messages", next);
    setChatText("");
  }
  async function removeLabMessage(id) {
    const next = labMessages.filter((m) => m.id !== id);
    setLabMessages(next);
    await saveCollection("gowlsec:lab_messages", next);
  }

  const selected = labs.find((l) => l.id === selectedId);
  const selectedMessages = selected ? labMessages.filter((m) => m.labId === selected.id) : [];
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedMessages.length, selectedId]);

  if (selected) {
    const isMember = selected.members.includes(pseudo);
    const isPrivate = selected.visibility === "private";
    const isFull = selected.members.length >= (selected.maxMembers || LAB_MAX_MEMBERS);
    const plat = LAB_PLATFORMS.find((p) => p.key === selected.platform) || LAB_PLATFORMS[3];
    return (
      <div>
        <GhostButton onClick={() => setSelectedId(null)}>← Retour aux labs</GhostButton>
        <Panel className="p-5 mt-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 rounded-md flex items-center justify-center shrink-0" style={{ background: `${C.primary}1A`, color: C.primary }}><Bug size={26} /></div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{selected.title}</h2>
                <Chip label={isPrivate ? "Privé" : "Public"} color={isPrivate ? C.warn : C.ok} />
                <Chip label={plat.label} color={C.primary} />
              </div>
              <p className="text-sm mt-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>{selected.description || "Aucune description."}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs flex items-center gap-1" style={{ color: C.muted, fontFamily: MONO_FONT }}>
                  <Users size={12} /> {selected.members.length}/{selected.maxMembers || LAB_MAX_MEMBERS} membres
                </span>
                <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>Créé par : {selected.owner}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isMember ? (
                selected.owner !== pseudo && <GhostButton onClick={() => leaveLab(selected.id)}>Quitter</GhostButton>
              ) : isFull ? (
                <span className="text-xs" style={{ color: C.alert, fontFamily: BODY_FONT }}>Salon complet</span>
              ) : isPrivate ? (
                <div className="flex items-center gap-2">
                  <input type="password" value={joinPwd[selected.id] || ""} onChange={(e) => setJoinPwd((p) => ({ ...p, [selected.id]: e.target.value }))}
                    placeholder="mot de passe" className="px-2.5 py-1.5 rounded-md text-xs w-32" style={inputStyle} />
                  <PrimaryButton onClick={() => joinLab(selected)}><KeyRound size={13} /> Rejoindre</PrimaryButton>
                </div>
              ) : (
                <PrimaryButton onClick={() => joinLab(selected)}><Plus size={14} /> Rejoindre</PrimaryButton>
              )}
              {(isAdmin || selected.owner === pseudo) && <GhostButton danger onClick={() => removeLab(selected.id)}><Trash2 size={12} /> Supprimer</GhostButton>}
            </div>
          </div>
          {joinError[selected.id] && <p className="text-xs mt-2 text-right" style={{ color: C.alert, fontFamily: BODY_FONT }}>{joinError[selected.id]}</p>}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
            {selected.members.map((m) => (
              <span key={m} className="text-xs px-2 py-1 rounded-md" style={{ background: C.panel2, color: C.text, fontFamily: MONO_FONT }}>{m}</span>
            ))}
          </div>
        </Panel>

        <Panel className="flex flex-col mt-5" style={{ height: 420 }}>
          <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: `1px solid ${C.line}` }}>
            <MessageSquare size={14} style={{ color: C.ok }} />
            <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>Discussion du salon lab</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {selectedMessages.length === 0 && <EmptyState text="Aucun message. Rejoins le salon pour discuter du lab." />}
            {selectedMessages.map((m) => (
              <div key={m.id} className="flex items-start gap-2 group">
                <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs shrink-0" style={{ background: C.panel2, color: C.primary, border: `1px solid ${C.line}`, fontFamily: MONO_FONT }}>
                  {m.author.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: C.text, fontFamily: MONO_FONT }}>{m.author}</span>
                    <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(m.createdAt)}</span>
                    {isAdmin && <button onClick={() => removeLabMessage(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: C.alert }}><Trash2 size={11} /></button>}
                  </div>
                  <p className="text-sm" style={{ color: C.text, fontFamily: BODY_FONT }}>{m.text}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          {isMember ? (
            <div className="flex items-center gap-2 p-3" style={{ borderTop: `1px solid ${C.line}` }}>
              <input value={chatText} onChange={(e) => setChatText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendLabMessage(selected.id)}
                placeholder="Écrire dans le salon..." className="flex-1 px-3 py-2 rounded-md text-sm" style={inputStyle} />
              <PrimaryButton onClick={() => sendLabMessage(selected.id)}><Send size={14} /></PrimaryButton>
            </div>
          ) : (
            <div className="p-3 text-center" style={{ borderTop: `1px solid ${C.line}` }}>
              {!currentUser ? (
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("open-auth-login"))} className="text-xs underline underline-offset-2" style={{ color: C.primary, fontFamily: BODY_FONT }}>
                  Connecte-toi pour rejoindre ce salon
                </button>
              ) : (
                <span className="text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>Rejoins le salon pour participer à la discussion.</span>
              )}
            </div>
          )}
        </Panel>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col gap-3 mb-5 md:flex-row md:items-start md:justify-between">
            <SectionHeader icon={<Bug size={19} />} eyebrow="Sessions live" title={t(lang, "labsTitle")} subtitle={t(lang, "labsSub")} accent={C.alert} />
            {!currentUser ? (
              <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent("open-auth-login"))}>Connexion</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => setShowCreate((s) => !s)}>{showCreate ? <X size={15} /> : <Plus size={15} />} {showCreate ? t(lang, "cancel") : t(lang, "newLab")}</PrimaryButton>
            )}
          </div>
          {!currentUser && (
            <GuestGate text="Connecte-toi pour ouvrir ou rejoindre un salon lab." accent={C.alert} />
          )}
          {showCreate && (
            <ModalOverlay onClose={() => setShowCreate(false)}>
              <CreationHero scene={<LabScene />} accent={C.alert} eyebrow={t(lang, "labsHeroEyebrow")}
                title={t(lang, "labsHeroTitle")}
                subtitle={t(lang, "labsHeroSub")}
                onClose={() => setShowCreate(false)}>
                <form onSubmit={createLab} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    <Field label="Titre du salon"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Blue (THM) — session du soir" className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
                    <Field label="Plateforme">
                      <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle}>
                        {LAB_PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Objectif de la session, niveau requis, horaires..." className="w-full px-2.5 py-1.75 rounded-md text-sm resize-none" style={inputStyle} /></Field>
                  <Field label="Visibilité (8 personnes max)">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setVisibility("public")} className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.75 rounded-md text-sm"
                        style={{ background: visibility === "public" ? C.primary : C.panel2, color: visibility === "public" ? "#fff" : C.muted, fontFamily: BODY_FONT }}>
                        <Globe size={14} /> Public
                      </button>
                      <button type="button" onClick={() => setVisibility("private")} className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.75 rounded-md text-sm"
                        style={{ background: visibility === "private" ? C.primary : C.panel2, color: visibility === "private" ? "#fff" : C.muted, fontFamily: BODY_FONT }}>
                        <Lock size={14} /> Privé
                      </button>
                    </div>
                  </Field>
                  {visibility === "private" && (
                    <Field label="Mot de passe du salon">
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Requis pour un salon privé" className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} />
                    </Field>
                  )}
                  <PrimaryButton type="submit" className="!py-2"><CheckCircle2 size={14} /> Créer</PrimaryButton>
                </form>
              </CreationHero>
            </ModalOverlay>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {labs.length === 0 && <EmptyState icon={<Bug size={20} />} accent={C.alert} text="Aucun salon lab pour l'instant. Sois le premier à en créer un pour avancer à plusieurs." cta="Créer" onCta={() => setShowCreate(true)} />}
            {labs.map((l) => {
              const isPrivate = l.visibility === "private";
              const plat = LAB_PLATFORMS.find((p) => p.key === l.platform) || LAB_PLATFORMS[3];
              const fillPct = Math.min(100, Math.round((l.members.length / (l.maxMembers || LAB_MAX_MEMBERS)) * 100));
              return (
                <Panel key={l.id} className="p-4 pt-5 cursor-pointer gowl-hud-card gowl-glass relative overflow-hidden" style={{ "--gowl-accent": C.alert }} onClick={() => setSelectedId(l.id)}>
                  <div aria-hidden className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${C.alert}, transparent)` }} />
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center shrink-0" style={{ background: `${C.alert}1A`, border: `1px solid ${C.alert}44`, color: C.alert }}><Bug size={18} /></div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{l.title}</h3>
                      <span className="text-xs flex items-center gap-1" style={{ color: C.muted, fontFamily: MONO_FONT }}>
                        <Users size={11} /> {l.members.length}/{l.maxMembers || LAB_MAX_MEMBERS} membres
                      </span>
                    </div>
                    <Chip label={isPrivate ? "Privé" : "Public"} color={isPrivate ? C.warn : C.ok} />
                  </div>
                  <div className="w-full rounded-full overflow-hidden mb-3" style={{ height: 4, background: C.panel2 }}>
                    <div className="gowl-bar-fill h-full rounded-full" style={{ width: `${fillPct}%`, background: `linear-gradient(90deg, ${C.alert}, ${C.alert}88)` }} />
                  </div>
                  <p className="text-xs line-clamp-2 mb-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>{l.description || "Aucune description."}</p>
                  <Chip label={plat.label} color={C.primary} />
                  <div className="mt-3 pt-2 flex items-center justify-between" style={{ borderTop: `1px solid ${C.line}` }}>
                    <span className="text-xs" style={{ color: C.primary, fontFamily: MONO_FONT }}>{l.owner}</span>
                    <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(l.createdAt)}</span>
                  </div>
                </Panel>
              );
            })}
          </div>
        </div>
        <InfoSidebar>
          <StatCardsRow vertical items={[
            { icon: <Bug size={13} />, label: "Salons ouverts", value: labs.length, accent: C.alert },
            { icon: <Users size={13} />, label: "Hackers connectés", value: labs.reduce((s, l) => s + l.members.length, 0), accent: C.primary },
            { icon: <Unlock size={13} />, label: "Places libres", value: labs.reduce((s, l) => s + Math.max(0, (l.maxMembers || LAB_MAX_MEMBERS) - l.members.length), 0), accent: C.ok },
          ]} />
        </InfoSidebar>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Classement — points calculés depuis trophées, forum et labs créés
--------------------------------------------------------------------- */
const TROPHY_POINTS = { facile: 10, moyen: 20, difficile: 35, insane: 50 };
const RANK_MEDALS = ["🥇", "🥈", "🥉"];

/* Points d'un membre — calcul partagé entre Classement et Profil (niveaux/XP) */
function computeUserPoints(username, questions, trophies, labs) {
  if (!username) return 0;
  let total = 0;
  trophies.forEach((t) => { if (t.author === username) total += TROPHY_POINTS[t.difficulty] || 10; });
  questions.forEach((q) => {
    if (q.author === username) total += 2;
    (q.answers || []).forEach((a) => { if (a.author === username) total += 3; });
  });
  labs.forEach((l) => { if (l.owner === username) total += 5; });
  return total;
}

/* Niveaux/XP — paliers construits sur les mêmes points que le classement */
const LEVELS = [
  { key: "debutant", label: "Débutant", min: 0, color: C.muted },
  { key: "initie", label: "Initié", min: 50, color: C.primary },
  { key: "operateur", label: "Opérateur", min: 150, color: C.ok },
  { key: "expert", label: "Expert", min: 350, color: C.warn },
  { key: "elite", label: "Elite", min: 700, color: C.alert },
  { key: "legende", label: "Légende", min: 1500, color: C.gold },
];
function getLevelInfo(points) {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) { if (points >= LEVELS[i].min) idx = i; }
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const span = next ? next.min - current.min : 1;
  const progressed = next ? points - current.min : span;
  const pct = next ? Math.min(100, Math.max(0, Math.round((progressed / span) * 100))) : 100;
  return { level: current, next, pct, pointsToNext: next ? next.min - points : 0 };
}

function LeaderboardTab({ questions, trophies, labs, teams, profiles, currentUser = null }) {
  const rows = useMemo(() => {
    const scores = {};
    function add(author, points, kind) {
      if (!author) return;
      if (!scores[author]) scores[author] = { author, total: 0, trophies: 0, forum: 0, labs: 0 };
      scores[author].total += points;
      scores[author][kind] += points;
    }
    trophies.forEach((t) => {
      if (!currentUser || (t.author || "") !== currentUser.username) add(t.author, TROPHY_POINTS[t.difficulty] || 10, "trophies");
    });
    questions.forEach((q) => {
      add(q.author, 2, "forum");
      (q.answers || []).forEach((a) => add(a.author, 3, "forum"));
    });
    labs.forEach((l) => {
      if (!currentUser || (l.owner || "") !== currentUser.username) add(l.owner, 5, "labs");
    });
    return Object.values(scores).sort((a, b) => b.total - a.total);
  }, [questions, trophies, labs]);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const podiumOrder = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i);
  const podiumStyle = [
    { h: 148, color: C.gold, label: "1ER", size: 64 },
    { h: 112, color: "#C7CCD6", label: "2E", size: 50 },
    { h: 90, color: "#D48A4C", label: "3E", size: 46 },
  ];
  const totalCommunityPoints = rows.reduce((s, r) => s + r.total, 0);
  const maxTotal = rows[0]?.total || 1;

  function Breakdown({ r, height = 5 }) {
    const parts = [
      { v: r.trophies, color: C.alert },
      { v: r.forum, color: C.primary },
      { v: r.labs, color: C.ok },
    ].filter((p) => p.v > 0);
    if (parts.length === 0) return null;
    return (
      <div className="flex w-full rounded-full overflow-hidden" style={{ height, background: C.panel2 }}>
        {parts.map((p, i) => (
          <div key={i} className="gowl-bar-fill" style={{ width: `${(p.v / r.total) * 100}%`, background: p.color }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0 w-full">
          <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
            <SectionHeader icon={<Trophy size={19} className="gowl-rank-glow" />} eyebrow="Live ranking" title="Classement" accent={C.gold}
              subtitle="Points cumulés : trophées (10 à 50 pts), participation au forum (2 à 3 pts), salons labs créés (5 pts)." />
          </div>
          {rows.length === 0 ? (
            <EmptyState icon={<Trophy size={20} />} accent={C.gold} text="Personne au classement pour l'instant. Ajoute un trophée, pose une question ou ouvre un salon lab pour décrocher la première place !" />
          ) : (
            <>
              {podium.length > 0 && (
                <Panel className="p-6 mb-6 overflow-hidden relative" style={{ border: `1px solid ${C.gold}33`, background: `linear-gradient(180deg, ${C.gold}12, ${C.panel} 55%)` }}>
                  <div aria-hidden className="gowl-podium-spot" style={{ width: 220, height: 220, left: "50%", top: -40, marginLeft: -110, background: C.gold }} />
                  <div className="relative flex items-end justify-center gap-3 sm:gap-7">
                    {podiumOrder.map((idx) => {
                      const r = podium[idx];
                      if (!r) return null;
                      const ps = podiumStyle[idx];
                      const profile = profiles.find((p) => p.username === r.author);
                      return (
                        <div key={r.author} className="flex flex-col items-center relative" style={{ width: 118 }}>
                          {idx === 0 && (
                            <Crown size={26} className="gowl-crown-float mb-1" style={{ color: C.gold, fill: `${C.gold}55` }} />
                          )}
                          <span className="text-2xl mb-1.5 gowl-medal-pop" style={{ animationDelay: `${idx * 0.12}s` }}>{RANK_MEDALS[idx]}</span>
                          <span className="gowl-rank-ring" style={{ "--gowl-accent": ps.color }}>
                            {profile ? <Avatar profile={profile} size={ps.size} /> : <div className="rounded-full shrink-0" style={{ width: ps.size, height: ps.size, background: C.panel2, border: `1px solid ${C.line}` }} />}
                          </span>
                          <p className="text-xs font-bold mt-2.5 truncate max-w-full" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{r.author}</p>
                          <p className="text-base font-extrabold gowl-count-pop" style={{ color: ps.color, fontFamily: DISPLAY_FONT }}>{r.total} <span className="text-[10px] font-semibold" style={{ color: C.muted }}>pts</span></p>
                          <div className="w-16 mt-1.5 mb-1"><Breakdown r={r} height={4} /></div>
                          <div className="gowl-podium-bar w-full mt-1.5 rounded-t-lg flex flex-col items-center justify-start pt-2 relative overflow-hidden" style={{ height: ps.h, background: `linear-gradient(180deg, ${ps.color}2E, ${ps.color}08)`, border: `1px solid ${ps.color}55`, borderBottom: "none", animationDelay: `${idx * 0.1}s` }}>
                            <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: ps.color, boxShadow: `0 0 12px 1px ${ps.color}CC` }} />
                            <span className="text-xs font-extrabold gowl-mono-tag" style={{ color: ps.color }}>{ps.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Panel>
              )}
              <div className="space-y-2">
                {rest.map((r, i) => {
                  const rank = i + 3;
                  const profile = profiles.find((p) => p.username === r.author);
                  const pct = Math.max(6, Math.round((r.total / maxTotal) * 100));
                  return (
                    <Panel key={r.author} className="p-3 gowl-hud-card relative overflow-hidden" style={{ "--gowl-accent": C.gold, background: rank % 2 === 0 ? C.panel : C.panel2 }}>
                      <div aria-hidden className="absolute left-0 top-0 bottom-0 gowl-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${C.gold}14, transparent)` }} />
                      <div className="relative flex items-center gap-3">
                        <span className="w-8 text-center text-sm font-bold shrink-0" style={{ color: rank < 10 ? C.text : C.muted, fontFamily: MONO_FONT }}>#{rank + 1}</span>
                        <span className="gowl-rank-ring" style={{ "--gowl-accent": rank < 10 ? C.primary : C.line }}>
                          {profile ? <Avatar profile={profile} size={34} /> : <div className="w-[34px] h-[34px] rounded-full shrink-0" style={{ background: C.panel2, border: `1px solid ${C.line}` }} />}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate" style={{ color: C.text, fontFamily: BODY_FONT }}>{r.author}</p>
                            {r.trophies > 0 && <span className="text-[10px] flex items-center gap-1" style={{ color: C.alert, fontFamily: MONO_FONT }}><Trophy size={9} /> {r.trophies}</span>}
                            {r.forum > 0 && <span className="text-[10px] flex items-center gap-1" style={{ color: C.primary, fontFamily: MONO_FONT }}><MessageSquare size={9} /> {r.forum}</span>}
                            {r.labs > 0 && <span className="text-[10px] flex items-center gap-1" style={{ color: C.ok, fontFamily: MONO_FONT }}><Bug size={9} /> {r.labs}</span>}
                          </div>
                          <div className="mt-1.5 max-w-[220px]"><Breakdown r={r} /></div>
                        </div>
                        <span className="text-lg font-extrabold shrink-0" style={{ color: C.gold, fontFamily: DISPLAY_FONT }}>{r.total}</span>
                      </div>
                    </Panel>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <InfoSidebar>
          {rows.length > 0 && (
            <StatCardsRow vertical items={[
              { icon: <TrendingUp size={13} />, label: "Total communauté", value: `${totalCommunityPoints.toLocaleString("fr-FR")} pts`, accent: C.gold },
              { icon: <Users size={13} />, label: "Joueurs classés", value: rows.length, accent: C.primary },
              { icon: <Crown size={13} />, label: "En tête", value: rows[0]?.author || "—", accent: C.ok },
            ]} />
          )}
          <Panel className="p-4 gowl-glass" style={{ border: `1px solid ${C.line}` }}>
            <span className="text-[10px] font-bold uppercase gowl-mono-tag block mb-3" style={{ color: C.muted }}>Comment gagner des points</span>
            <div className="flex flex-col gap-3">
              {[
                { icon: <Trophy size={16} />, color: C.alert, label: "Trophées", desc: "10 à 50 pts selon la difficulté (facile → insane)." },
                { icon: <MessageSquare size={16} />, color: C.primary, label: "Forum", desc: "2 pts par question posée, 3 pts par réponse donnée." },
                { icon: <Bug size={16} />, color: C.ok, label: "Salons labs", desc: "5 pts pour chaque salon lab ouvert." },
              ].map((it) => (
                <div key={it.label} className="flex items-start gap-2.5 p-3 rounded-lg" style={{ background: C.panel2, border: `1px solid ${it.color}33` }}>
                  <span className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: `${it.color}1A`, color: it.color }}>{it.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{it.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.muted, fontFamily: BODY_FONT }}>{it.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </InfoSidebar>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Trophées
--------------------------------------------------------------------- */
function TrophyTab({ pseudo, trophies, setTrophies, isAdmin, currentUser = null }) {
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0].key);
  const [note, setNote] = useState("");
  const [certification, setCertification] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageName, setImageName] = useState("");

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setImageUrl(dataUrl);
      setImageName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function submit(e) {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim()) return;
    const t = {
      id: uid(),
      author: pseudo,
      platform,
      title: title.trim(),
      difficulty,
      note: note.trim(),
      certification: certification.trim(),
      imageUrl: imageUrl || "",
      createdAt: new Date().toISOString(),
    };
    const next = [t, ...trophies];
    setTrophies(next);
    saveCollection("gowlsec:trophies", next);
    setTitle(""); setNote(""); setCertification(""); setImageUrl(""); setImageName(""); setDifficulty(DIFFICULTIES[0].key); setShowForm(false);
  }
  async function removeTrophy(id) {
    const next = trophies.filter((t) => t.id !== id);
    setTrophies(next);
    saveCollection("gowlsec:trophies", next);
  }
  const filtered = trophies;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <SectionHeader icon={<Award size={19} />} eyebrow="Achievements" title="Salon trophées" subtitle="Affiche tes badges, certifications et réussites partagées." accent={C.alert} />
        {!currentUser ? (
          <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent("open-auth-login"))}>Connexion</PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => setShowForm((s) => !s)}>{showForm ? <X size={15} /> : <Award size={15} />} {showForm ? "Annuler" : "Ajouter un trophée"}</PrimaryButton>
        )}
      </div>
      {!currentUser && (
        <GuestGate text="Connecte-toi pour ajouter des trophées et participer à l'espace communauté." accent={C.alert} />
      )}
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <CreationHero scene={<TrophyScene />} accent={C.alert} eyebrow="Nouveau trophée" title="Ajoute un badge ou une réussite" subtitle="Partage une machine résolue, un challenge validé ou un accomplissement de parcours." onClose={() => setShowForm(false)}>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <Field label="Plateforme">
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Nom de la machine / badge"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Blue, Vulnversity..." className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              </div>
              <Field label="Difficulté">
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button type="button" key={d.key} onClick={() => setDifficulty(d.key)} style={{ opacity: difficulty === d.key ? 1 : 0.5 }}><Chip label={d.label} color={d.color} /></button>
                  ))}
                </div>
              </Field>
              <Field label="Certification"><input value={certification} onChange={(e) => setCertification(e.target.value)} placeholder="Ex : OSCP, eJPT, PNPT..." className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              <Field label="Photo du trophée">
                <label className="flex cursor-pointer items-center justify-center rounded-md border border-dashed px-3 py-2.5 text-sm" style={{ borderColor: C.line, background: C.panel2, color: C.muted }}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <span>{imageName ? `Fichier prêt : ${imageName}` : "Choisir une image"}</span>
                </label>
                {imageUrl && (
                  <div className="mt-2 overflow-hidden rounded-lg border" style={{ borderColor: C.line }}>
                    <img src={imageUrl} alt="Aperçu du trophée" className="h-36 w-full object-cover" />
                  </div>
                )}
              </Field>
              <Field label="Note (optionnel)"><input value={note} onChange={(e) => setNote(e.target.value)} className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              <PrimaryButton type="submit" className="!py-2"><CheckCircle2 size={14} /> Ajouter au salon</PrimaryButton>
            </form>
          </CreationHero>
        </ModalOverlay>
      )}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <EmptyState text="Aucun trophée ici pour le moment." />}
        {filtered.map((t) => {
          const d = DIFFICULTIES.find((x) => x.key === t.difficulty) || DIFFICULTIES[0];
          return (
            <Panel key={t.id} className="p-4 relative gowl-hud-card gowl-glass gowl-sweep-wrap" style={{ "--gowl-accent": d.color, borderColor: `${d.color}55`, background: `linear-gradient(165deg, ${d.color}14, ${C.panel})` }}>
              {isAdmin && <button onClick={() => removeTrophy(t.id)} className="absolute top-3 right-3 z-10" style={{ color: C.alert }}><Trash2 size={13} /></button>}
              {t.imageUrl ? (
                <div className="mb-3 overflow-hidden rounded-lg border" style={{ borderColor: `${d.color}44` }}>
                  <img src={t.imageUrl} alt={t.title} className="h-36 w-full object-cover" />
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-3">
                  <div className="gowl-trophy-badge" style={{ background: `linear-gradient(155deg, ${d.color}33, ${d.color}0A)`, border: `1px solid ${d.color}77` }}>
                    <Trophy size={20} style={{ color: d.color }} className="gowl-rank-glow" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase gowl-mono-tag block" style={{ color: C.muted }}>{t.platform}</span>
                    <h3 className="font-semibold text-sm truncate" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{t.title}</h3>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Chip label={d.label} color={d.color} />
                {t.certification && <Chip label={t.certification} color={C.primary} />}
              </div>
              {t.note && <p className="text-xs mt-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>{t.note}</p>}
              <div className="mt-3 pt-2 flex items-center justify-between" style={{ borderTop: `1px solid ${C.line}` }}>
                <span className="text-xs" style={{ color: C.primary, fontFamily: MONO_FONT }}>{t.author}</span>
                <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(t.createdAt)}</span>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Support — tickets utilisateur
--------------------------------------------------------------------- */
function SupportTab({ pseudo, currentUser, tickets, setTickets, supportThreads, setSupportThreads }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("question");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState(currentUser?.email || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    if (!selectedTicketId && tickets[0]) setSelectedTicketId(tickets[0].id);
    else if (selectedTicketId && !tickets.find((ticket) => ticket.id === selectedTicketId) && tickets[0]) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || tickets[0] || null;
  const selectedThread = supportThreads.find((thread) => thread.ticketId === selectedTicket?.id) || null;

  async function submitTicket(e) {
    e.preventDefault();
    setError("");
    const cleanTitle = title.trim();
    const cleanMessage = message.trim();
    const cleanEmail = contactEmail.trim().toLowerCase();
    if (!cleanTitle || !cleanMessage) return setError("Ajoute un objet et un message pour envoyer ton ticket.");
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return setError("Adresse e-mail invalide.");

    const now = new Date().toISOString();
    const ticket = {
      id: uid(),
      author: currentUser?.username || pseudo,
      email: cleanEmail || currentUser?.email || "",
      userId: currentUser?.id || null,
      category,
      title: cleanTitle,
      message: cleanMessage,
      status: "open",
      createdAt: now,
      updatedAt: now,
    };
    const thread = {
      id: uid(),
      ticketId: ticket.id,
      participantId: currentUser?.id || null,
      participantName: ticket.author,
      participantEmail: ticket.email,
      status: "open",
      messages: [{ id: uid(), sender: "user", author: ticket.author, text: cleanMessage, createdAt: now }],
      updatedAt: now,
    };
    const nextTickets = [ticket, ...tickets];
    const nextThreads = [thread, ...supportThreads.filter((item) => item.ticketId !== ticket.id)];
    setTickets(nextTickets);
    setSupportThreads(nextThreads);
    await Promise.all([
      saveCollection("gowlsec:tickets", nextTickets),
      saveCollection("gowlsec:support_threads", nextThreads),
    ]);
    setTitle("");
    setMessage("");
    setCategory("question");
    setContactEmail(currentUser?.email || "");
    setStatus("Ticket envoyé avec succès. Merci pour ta demande.");
    setSelectedTicketId(ticket.id);
  }

  async function submitReply(e) {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return setReplyError("Écris un message pour continuer la conversation.");
    const now = new Date().toISOString();
    const nextThreads = supportThreads.map((thread) => {
      if (thread.ticketId !== selectedTicket.id) return thread;
      const nextMessages = [...thread.messages, { id: uid(), sender: "user", author: currentUser?.username || pseudo, text: replyText.trim(), createdAt: now }];
      return { ...thread, messages: nextMessages, status: thread.status === "resolved" ? "resolved" : "in_progress", updatedAt: now };
    });
    setSupportThreads(nextThreads);
    await saveCollection("gowlsec:support_threads", nextThreads);
    setReplyText("");
    setReplyError("");
    setStatus("Message envoyé au support.");
  }

  return (
    <div className="space-y-6">
      <Panel className="p-5 overflow-hidden relative" style={{ background: "linear-gradient(135deg, rgba(91,110,245,0.2) 0%, rgba(18,21,27,0.98) 50%, rgba(255,77,94,0.12) 100%)", border: `1px solid ${C.primary}33` }}>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[0.3em] mb-3" style={{ background: `${C.primary}22`, color: C.primary, border: `1px solid ${C.primary}33` }}>
              <Mail size={12} /> Support GowlSec
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Ouvre un ticket de demande</h2>
            <p className="text-sm" style={{ color: C.muted, fontFamily: BODY_FONT }}>Choisis une catégorie, décris ton besoin et l'équipe te recontactera dès que possible.</p>
          </div>
          <div className="rounded-xl px-3 py-2 text-sm" style={{ background: `${C.panel2}CC`, border: `1px solid ${C.line}` }}>
            <span style={{ color: C.muted, fontFamily: MONO_FONT }}>Demandes reçues</span>
            <div className="text-lg font-semibold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{tickets.length}</div>
          </div>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="space-y-4">
          <Panel className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={15} style={{ color: C.gold }} />
              <h3 className="text-sm font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Questions fréquentes</h3>
            </div>
            <div className="space-y-1.5">
              {SUPPORT_FAQ.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
                    <button type="button" onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left" style={{ background: C.panel2 }}>
                      <span className="text-xs font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{f.q}</span>
                      {isOpen ? <ChevronUp size={13} style={{ color: C.muted, flexShrink: 0 }} /> : <ChevronDown size={13} style={{ color: C.muted, flexShrink: 0 }} />}
                    </button>
                    {isOpen && <p className="text-xs px-3 py-2.5" style={{ color: C.muted, fontFamily: BODY_FONT, background: C.panel }}>{f.a}</p>}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] mt-3" style={{ color: C.muted, fontFamily: BODY_FONT }}>Pas trouvé de réponse ? Ouvre un ticket ci-dessous, l'équipe te répond directement dans ta conversation privée.</p>
          </Panel>

          <Panel className="p-4">
            <h3 className="text-sm font-bold mb-3" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Nouveau ticket</h3>
            <form onSubmit={submitTicket}>
              <Field label="Catégorie">
                <div className="flex flex-wrap gap-2">
                  {SUPPORT_CATEGORIES.map((c) => {
                    const active = category === c.key;
                    const Icon = c.icon;
                    return (
                      <button type="button" key={c.key} onClick={() => setCategory(c.key)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: active ? `${c.color}22` : C.panel2, border: `1px solid ${active ? c.color : C.line}`, color: active ? c.color : C.muted, fontFamily: BODY_FONT }}>
                        <Icon size={13} /> {c.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Objet de la demande">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: commande boutique, problème de connexion..." className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} />
              </Field>
              <Field label="Votre e-mail (optionnel)">
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="votre@email.com" className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} />
              </Field>
              <Field label="Détail de la demande">
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Explique clairement ton besoin, le contexte et ce que tu attends." className="w-full px-3 py-2 rounded-md text-sm" style={inputStyle} />
              </Field>
              {error && <p className="text-xs mb-3" style={{ color: C.alert, fontFamily: BODY_FONT }}>{error}</p>}
              {status && <p className="text-xs mb-3" style={{ color: C.ok, fontFamily: BODY_FONT }}>{status}</p>}
              <PrimaryButton type="submit"><Send size={14} /> Envoyer le ticket</PrimaryButton>
            </form>
          </Panel>
        </div>

        <Panel className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle size={15} style={{ color: C.primary }} />
            <h3 className="text-sm font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Conversation privée</h3>
          </div>
          {tickets.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center" style={{ borderColor: C.line, color: C.muted }}>
              <p className="text-sm">Aucun ticket pour le moment.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {tickets.map((ticket) => {
                  const cat = SUPPORT_CATEGORIES.find((c) => c.key === ticket.category) || SUPPORT_CATEGORIES[0];
                  const st = SUPPORT_STATUS[ticket.status] || SUPPORT_STATUS.open;
                  const active = selectedTicket?.id === ticket.id;
                  const CatIcon = cat.icon;
                  return (
                    <button key={ticket.id} type="button" onClick={() => setSelectedTicketId(ticket.id)} className="w-full rounded-lg p-3 text-left" style={{ background: active ? `${C.primary}22` : C.panel2, border: `1px solid ${active ? C.primary : C.line}` }}>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em]" style={{ color: cat.color, fontFamily: MONO_FONT }}><CatIcon size={11} /> {cat.label}</span>
                        <span className="text-[10px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(ticket.createdAt)}</span>
                      </div>
                      <h4 className="text-sm font-semibold mb-1.5" style={{ color: C.text, fontFamily: BODY_FONT }}>{ticket.title}</h4>
                      <div className="flex items-center justify-between text-[11px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>
                        <span>{ticket.author}</span>
                        <span className="px-2 py-0.5 rounded-full font-semibold" style={{ background: `${st.color}1A`, color: st.color }}>{st.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedTicket && (
                <div className="rounded-lg p-3" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{selectedTicket.title}</h4>
                    <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>{selectedTicket.message}</p>
                  </div>
                  <div className="space-y-2 mb-3 max-h-[220px] overflow-y-auto pr-1">
                    {(selectedThread?.messages || []).map((message) => (
                      <div key={message.id} className={`rounded-md px-3 py-2 ${message.sender === "admin" ? "ml-4" : "mr-4"}`} style={{ background: message.sender === "admin" ? `${C.primary}22` : `${C.ok}14`, border: `1px solid ${message.sender === "admin" ? C.primary : C.ok}33` }}>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{message.author}</span>
                          <span className="text-[10px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(message.createdAt)}</span>
                        </div>
                        <p className="text-xs" style={{ color: C.text, fontFamily: BODY_FONT }}>{message.text}</p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={submitReply}>
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} rows={3} placeholder="Répondre au support..." className="w-full px-3 py-2 rounded-md text-sm mb-2" style={inputStyle} />
                    {replyError && <p className="text-xs mb-2" style={{ color: C.alert, fontFamily: BODY_FONT }}>{replyError}</p>}
                    <PrimaryButton type="submit"><Send size={14} /> Envoyer</PrimaryButton>
                  </form>
                </div>
              )}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Boutique — juste un bouton cliquable, pas de logique réelle
--------------------------------------------------------------------- */
function ShopTab() {
  return (
    <Panel className="p-6 text-center">
      <ShoppingCart size={22} color={C.gold} className="mx-auto mb-2" />
      <h2 className="text-lg font-bold mb-1" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Boutique</h2>
      <p className="text-sm mb-4" style={{ color: C.muted, fontFamily: BODY_FONT }}>Bientôt disponible.</p>
      <PrimaryButton onClick={() => {}}>Voir les offres</PrimaryButton>
    </Panel>
  );
}

/* ---------------------------------------------------------------------
   Assistant IA
--------------------------------------------------------------------- */
function AIAssistantTab({ pseudo }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Salut ${pseudo} ! Je suis l'assistant GowlSec. Je peux t'aider à structurer ta démarche en cybersécurité : méthodologie, Linux, web, réseau, CTF, écriture de rapport, et déblocage de labs légaux. Pose une question précise et je te guiderai étape par étape.` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const apiKey = typeof window !== "undefined" ? window.localStorage.getItem("gowlsec:ai-key") : "";
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const buildLocalReply = (question) => {
      const q = question.toLowerCase();
      if (q.includes("linux") || q.includes("commande")) {
        return `Comprendre le problème\n- Identifie précisément la commande, le message d'erreur et le contexte.\n\nHypothèses\n- Vérifie si l'utilisateur a les permissions adéquates.\n- Confirme si la commande est exécutée sur un environnement légal et contrôlé.\n\nActions concrètes\n1. Répète la commande avec la sortie complète.\n2. Vérifie l'état du système avec whoami, id, pwd et ls.\n3. Si un service est concerné, teste journalctl ou systemctl.\n\nVérifications\n- Compare la sortie attendue avec le résultat réel.\n- Note chaque étape pour éviter les erreurs répétées.\n\nPoints à retenir\n- La méthode la plus rapide est souvent de reproduire le problème de façon isolée et d'observer les logs.`;
      }
      if (q.includes("web") || q.includes("sql") || q.includes("xss") || q.includes("csrf") || q.includes("api")) {
        return `Comprendre le problème\n- Définis le périmètre : frontend, backend, API, base de données ou authentification.\n\nHypothèses\n- Vérifie si l'anomalie vient d'une validation insuffisante, d'un manque de droits ou d'un mauvais flux de données.\n\nActions concrètes\n1. Reproduis le scénario dans un environnement contrôlé.\n2. Inspecte les requêtes réseau, les headers et les réponses.\n3. Vérifie les validations côté client et côté serveur.\n\nVérifications\n- Teste un cas normal puis un cas anormal.\n- Compare les résultats avant/après chaque correction.\n\nPoints à retenir\n- En sécurité web, la moindre hypothèse doit être validée par une reproduction claire.`;
      }
      if (q.includes("ctf") || q.includes("lab") || q.includes("challenge")) {
        return `Comprendre le problème\n- Clarifie le type de challenge : web, réseau, forensics, reverse, cryptographie ou système.\n\nHypothèses\n- Identifie les indices fournis, le contexte du lab et les outils qui pourraient être utiles.\n\nActions concrètes\n1. Commence par lister les artefacts et les fichiers fournis.\n2. Observe les métadonnées, les logs et les messages implicites.\n3. Applique une méthode progressive : reconnaissance, analyse, exploitation contrôlée, validation.\n\nVérifications\n- Vérifie chaque découverte avant de passer à l'étape suivante.\n- Documente ce que tu as appris pour ne pas repartir à zéro.\n\nPoints à retenir\n- Un bon CTF repose sur la méthode, pas sur la vitesse.`;
      }
      return `Comprendre le problème\n- Décris précisément le contexte, le symptôme observable et le résultat attendu.\n\nHypothèses\n- Vérifie si le blocage vient d'une mauvaise configuration, d'un manque de permissions ou d'une compréhension incomplète du sujet.\n\nActions concrètes\n1. Isole la zone problématique.\n2. Rassemble les informations disponibles : logs, captures, messages d'erreur, structure du système.\n3. Teste une hypothèse à la fois et note les résultats.\n\nVérifications\n- Confirme la correction avec un scénario de validation simple.\n- Si besoin, reformule la question avec plus de détails.\n\nPoints à retenir\n- En cybersécurité, une méthode claire vaut souvent mieux qu'une solution improvisée.`;
    };

    try {
      try {
        if (apiKey) {
          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 1400,
              system: `Tu es l'assistant IA de GowlSec, une communauté francophone de pentest et de CTF. Tu réponds en français, de manière claire, précise et pédagogique. Tu aides sur la méthodologie de pentest, l'analyse de vulnérabilités web, la compréhension du réseau, Linux, les bases de l'OSINT, la préparation d'examens, la rédaction de rapports, les stratégies de résolution de labs/CTF légaux, ainsi que l'organisation d'un workflow d'apprentissage. Tu dois :
- privilégier une approche éthique et sécurisée ;
- refuser toute demande d'attaque contre un système réel sans autorisation ;
- proposer des étapes concrètes, des hypothèses, des commandes utiles et des bonnes pratiques ;
- adapter le niveau à débutant, intermédiaire ou avancé ;
- si le contexte est flou, demander un minimum de détails avant de proposer une solution ;
- structurer la réponse avec : Comprendre le problème, Hypothèses, Actions concrètes, Vérifications, Points à retenir.
Reste concis mais suffisamment détaillé pour être utile.`,
              messages: next.map((m) => ({ role: m.role, content: m.content })),
            }),
          });

          if (!response.ok) throw new Error("API unavailable");

          const data = await response.json();
          const textBlocks = (data?.content || []).filter((b) => b.type === "text").map((b) => b.text);
          const reply = textBlocks.join("\n").trim();
          if (reply) {
            setMessages((m) => [...m, { role: "assistant", content: reply }]);
            return;
          }
        }
      } catch {
        // fallback local response below
      }

      const fallback = buildLocalReply(input.trim());
      setMessages((m) => [...m, { role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.primary}28, ${C.ok}22)`, border: `1px solid ${C.primary}33` }}>
          <Bot size={20} style={{ color: C.primary }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Assistant IA</h2>
          <p className="text-sm" style={{ color: C.muted, fontFamily: BODY_FONT }}>Une aide rapide en cas de blocage, disponible à toute heure.</p>
        </div>
      </div>
      <Panel className="flex flex-col overflow-hidden" style={{ height: 520, background: "linear-gradient(145deg, rgba(8, 14, 21, 0.98), rgba(12, 19, 28, 0.95))", border: `1px solid ${C.primary}22`, boxShadow: `0 22px 60px -36px rgba(91,110,245,0.45)` }}>
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: "radial-gradient(circle at top left, rgba(91,110,245,0.12), transparent 36%), linear-gradient(180deg, rgba(255,255,255,0.025), transparent)" }}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap"
                style={{
                  background: m.role === "user" ? "linear-gradient(135deg, #5B6EF5 0%, #2ED9A3 100%)" : "rgba(255,255,255,0.05)",
                  color: m.role === "user" ? "#fff" : C.text,
                  fontFamily: BODY_FONT,
                  border: m.role === "user" ? "none" : `1px solid ${C.line}`,
                  boxShadow: m.role === "user" ? "0 12px 24px -16px rgba(91,110,245,0.6)" : "none",
                }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-3.5 py-2.5 rounded-2xl text-sm flex items-center gap-2" style={{ background: "rgba(255,255,255,0.05)", color: C.muted, border: `1px solid ${C.line}`, fontFamily: BODY_FONT }}>
                <Sparkles size={13} className="animate-pulse" /> l'assistant réfléchit...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex items-center gap-2 p-3" style={{ borderTop: `1px solid ${C.line}`, background: `linear-gradient(90deg, rgba(91,110,245,0.12), rgba(46,217,163,0.1))`, backdropFilter: "blur(10px)" }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Décris ton problème..." disabled={loading} className="flex-1 px-3 py-2 rounded-md text-sm" style={{ ...inputStyle, background: "rgba(5,10,16,0.75)", border: "1px solid rgba(91,110,245,0.28)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }} />
          <PrimaryButton onClick={send} disabled={loading}><Send size={14} /></PrimaryButton>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Admin
--------------------------------------------------------------------- */
function AdminList({ title, icon, items, onDelete }) {
  return (
    <Panel className="p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: C.primary }}>{icon}</span>
        <span className="text-sm font-semibold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{title}</span>
        <span className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>({items.length})</span>
      </div>
      {items.length === 0 ? <p className="text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>Rien ici.</p> : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md" style={{ background: C.panel2 }}>
              <div className="min-w-0">
                <p className="text-xs truncate" style={{ color: C.text, fontFamily: BODY_FONT }}>{it.primary}</p>
                <p className="text-xs" style={{ color: C.muted, fontFamily: MONO_FONT }}>{it.secondary}</p>
              </div>
              <button onClick={() => onDelete(it.id)} style={{ color: C.alert }} className="shrink-0"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function AdminTab({
  isAdmin, setIsAdmin, questions, setQuestions, messages, setMessages, trophies, setTrophies,
  events, setEvents, profiles, teams, setTeams, teamAnnouncements, setTeamAnnouncements, orders, setOrders,
  labs, setLabs, labMessages, setLabMessages, tickets, setTickets, supportThreads, setSupportThreads,
}) {
  const [presence, setPresence] = useState([]);
  const [loadingPresence, setLoadingPresence] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [adminReply, setAdminReply] = useState("");
  const [adminNotice, setAdminNotice] = useState("");

  async function refreshPresence() {
    setLoadingPresence(true);
    try {
      const listing = await window.storage.list("gowlsec:presence:", true);
      const keys = listing?.keys || [];
      const results = await Promise.all(keys.map(async (k) => {
        try {
          const r = await window.storage.get(k, true);
          return r ? JSON.parse(r.value) : null;
        } catch { return null; }
      }));
      setPresence(results.filter(Boolean));
    } catch { /* best effort */ }
    setLoadingPresence(false);
  }
  useEffect(() => { if (isAdmin) refreshPresence(); }, [isAdmin]);
  useEffect(() => {
    if (!selectedTicketId && tickets[0]) setSelectedTicketId(tickets[0].id);
    else if (selectedTicketId && !tickets.find((ticket) => ticket.id === selectedTicketId) && tickets[0]) {
      setSelectedTicketId(tickets[0].id);
    }
  }, [tickets, selectedTicketId]);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || tickets[0] || null;
  const selectedThread = supportThreads.find((thread) => thread.ticketId === selectedTicket?.id) || null;

  async function clearAll() {
    setQuestions([]); setMessages([]); setTrophies([]); setTickets([]); setSupportThreads([]);
    saveCollection("gowlsec:questions", []);
    saveCollection("gowlsec:chat", []);
    saveCollection("gowlsec:trophies", []);
    saveCollection("gowlsec:tickets", []);
    saveCollection("gowlsec:support_threads", []);
  }

  async function updateTicketStatus(nextStatus) {
    if (!selectedTicket) return;
    const nextTickets = tickets.map((ticket) => ticket.id === selectedTicket.id ? { ...ticket, status: nextStatus, updatedAt: new Date().toISOString() } : ticket);
    setTickets(nextTickets);
    await saveCollection("gowlsec:tickets", nextTickets);
  }

  async function sendAdminReply(e) {
    e.preventDefault();
    if (!selectedTicket || !adminReply.trim()) return setAdminNotice("Écris un message pour répondre au ticket.");
    const now = new Date().toISOString();
    const nextTickets = tickets.map((ticket) => ticket.id === selectedTicket.id ? { ...ticket, status: ticket.status === "resolved" ? "resolved" : "in_progress", updatedAt: now } : ticket);
    const nextThreads = supportThreads.map((thread) => {
      if (thread.ticketId !== selectedTicket.id) return thread;
      return { ...thread, messages: [...thread.messages, { id: uid(), sender: "admin", author: "Admin Web", text: adminReply.trim(), createdAt: now }], status: "in_progress", updatedAt: now };
    });
    setTickets(nextTickets);
    setSupportThreads(nextThreads);
    await Promise.all([
      saveCollection("gowlsec:tickets", nextTickets),
      saveCollection("gowlsec:support_threads", nextThreads),
    ]);
    setAdminReply("");
    setAdminNotice("Réponse envoyée au membre.");
  }

  if (!isAdmin) {
    return (
      <div className="max-w-sm mx-auto text-center py-10">
        <Lock size={28} className="mx-auto mb-3" style={{ color: C.primary }} />
        <h2 className="text-lg font-bold mb-1" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Panel admin</h2>
        <p className="text-sm mb-5" style={{ color: C.muted, fontFamily: BODY_FONT }}>Accès réservé aux comptes admin. Connecte-toi avec un compte admin pour continuer.</p>
        <PrimaryButton onClick={() => window.dispatchEvent(new Event("open-auth-login"))}><Unlock size={14} /> Se connecter</PrimaryButton>
      </div>
    );
  }

  const now = Date.now();
  const onlineCount = presence.filter((p) => now - new Date(p.lastSeen).getTime() < ONLINE_WINDOW_MS).length;
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Panel admin</h2>
          <p className="text-sm mt-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>Modération et suivi de la communauté.</p>
        </div>
        <GhostButton onClick={() => setIsAdmin(false)}><Lock size={12} /> Se déconnecter</GhostButton>
      </div>

      <div className="grid sm:grid-cols-3 lg:grid-cols-8 gap-3 mb-6">
        <StatChip icon={<Wifi size={14} />} label="en ligne" value={onlineCount} />
        <StatChip icon={<UserIcon size={14} />} label="profils" value={profiles.length} />
        <StatChip icon={<Calendar size={14} />} label="événements" value={events.length} />
        <StatChip icon={<Flag size={14} />} label="questions" value={questions.length} />
        <StatChip icon={<MessageSquare size={14} />} label="messages" value={messages.length} />
        <StatChip icon={<Trophy size={14} />} label="trophées" value={trophies.length} />
        <StatChip icon={<Bug size={14} />} label="labs" value={labs.length} />
        <StatChip icon={<ShoppingCart size={14} />} label="ventes" value={orders.length} />
      </div>

      <Panel className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Activity size={15} style={{ color: C.ok }} />
            <span className="text-sm font-semibold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Utilisateurs</span>
          </div>
          <GhostButton onClick={refreshPresence}><RefreshCw size={12} className={loadingPresence ? "animate-spin" : ""} /> Actualiser</GhostButton>
        </div>
        {profiles.length === 0 ? <p className="text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>Aucun profil enregistré.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ fontFamily: BODY_FONT }}>
              <thead>
                <tr style={{ color: C.muted, fontFamily: MONO_FONT }}>
                  <th className="text-left font-normal pb-2">Statut</th>
                  <th className="text-left font-normal pb-2">Utilisateur</th>
                  <th className="text-left font-normal pb-2">E-mail</th>
                  <th className="text-left font-normal pb-2">Connexion</th>
                  <th className="text-left font-normal pb-2">Membre depuis</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => {
                  const pres = presence.find((x) => x.userId === p.id);
                  const online = pres && (now - new Date(pres.lastSeen).getTime() < ONLINE_WINDOW_MS);
                  return (
                    <tr key={p.id} style={{ borderTop: `1px solid ${C.line}` }}>
                      <td className="py-2">
                        <span className="inline-flex items-center gap-1.5">
                          <Circle size={8} fill={online ? C.ok : C.muted} color={online ? C.ok : C.muted} />
                          {online ? "En ligne" : "Hors ligne"}
                        </span>
                      </td>
                      <td className="py-2" style={{ color: C.text }}>{p.username}</td>
                      <td className="py-2" style={{ color: C.text }}>{p.email || "—"}</td>
                      <td className="py-2">{p.provider === "discord" ? "Discord" : "E-mail"}</td>
                      <td className="py-2" style={{ color: C.muted }}>{timeAgo(p.joinedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-1"><AlertTriangle size={15} style={{ color: C.alert }} /><span className="text-sm font-semibold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Zone dangereuse</span></div>
        <p className="text-xs mb-3" style={{ color: C.muted, fontFamily: BODY_FONT }}>Supprime tout le contenu partagé (questions, messages, trophées).</p>
        <GhostButton danger onClick={clearAll}><Trash2 size={12} /> Tout réinitialiser</GhostButton>
      </Panel>

      <AdminList title="Événements" icon={<Calendar size={14} />} items={events.map((e) => ({ id: e.id, primary: e.title, secondary: `${e.author} · ${new Date(e.date).toLocaleDateString("fr-FR")}` }))}
        onDelete={(id) => { const next = events.filter((e) => e.id !== id); setEvents(next); saveCollection("gowlsec:events", next); }} />
      <AdminList title="Questions" icon={<Flag size={14} />} items={questions.map((q) => ({ id: q.id, primary: q.title, secondary: `${q.author} · ${timeAgo(q.createdAt)}` }))}
        onDelete={(id) => { const next = questions.filter((q) => q.id !== id); setQuestions(next); saveCollection("gowlsec:questions", next); }} />
      <AdminList title="Messages des salons" icon={<MessageSquare size={14} />} items={messages.map((m) => ({ id: m.id, primary: m.text, secondary: `#${m.room || "general"} · ${m.author}` }))}
        onDelete={(id) => { const next = messages.filter((m) => m.id !== id); setMessages(next); saveCollection("gowlsec:chat", next); }} />
      <AdminList title="Trophées" icon={<Trophy size={14} />} items={trophies.map((t) => ({ id: t.id, primary: `${t.platform} — ${t.title}`, secondary: `${t.author} · ${timeAgo(t.createdAt)}` }))}
        onDelete={(id) => { const next = trophies.filter((t) => t.id !== id); setTrophies(next); saveCollection("gowlsec:trophies", next); }} />
      <AdminList title="Team" icon={<Users size={14} />} items={teams.map((t) => ({ id: t.id, primary: `${t.name} (${t.visibility === "private" ? "privée" : "publique"})`, secondary: `${t.members.length}/${t.maxMembers || TEAM_MAX_MEMBERS} membre(s) · capitaine ${t.owner}` }))}
        onDelete={(id) => {
          const next = teams.filter((t) => t.id !== id); setTeams(next); saveCollection("gowlsec:teams", next);
          const na = teamAnnouncements.filter((a) => a.teamId !== id); setTeamAnnouncements(na); saveCollection("gowlsec:team_announcements", na);
        }} />
      <AdminList title="Salons labs" icon={<Bug size={14} />} items={labs.map((l) => ({ id: l.id, primary: `${l.title} (${l.visibility === "private" ? "privé" : "public"})`, secondary: `${l.members.length}/${l.maxMembers || LAB_MAX_MEMBERS} membre(s) · ${l.owner}` }))}
        onDelete={(id) => {
          const next = labs.filter((l) => l.id !== id); setLabs(next); saveCollection("gowlsec:labs", next);
          const nm = labMessages.filter((m) => m.labId !== id); setLabMessages(nm); saveCollection("gowlsec:lab_messages", nm);
        }} />
      <AdminList title="Commandes boutique" icon={<ShoppingCart size={14} />} items={orders.map((o) => ({ id: o.id, primary: `${o.items.join(", ")} — ${o.total}€`, secondary: `${o.buyer} · ${o.email} · ${timeAgo(o.createdAt)}` }))}
        onDelete={(id) => { const next = orders.filter((o) => o.id !== id); setOrders(next); saveCollection("gowlsec:orders", next); }} />
      <AdminList title="Tickets support" icon={<Mail size={14} />} items={tickets.map((t) => ({ id: t.id, primary: `${t.title} · ${t.category}`, secondary: `${t.author} · ${t.email || "sans e-mail"} · ${timeAgo(t.createdAt)}` }))}
        onDelete={(id) => { const next = tickets.filter((t) => t.id !== id); setTickets(next); saveCollection("gowlsec:tickets", next); }} />

      <Panel className="p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={15} style={{ color: C.primary }} />
          <span className="text-sm font-semibold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Support privé</span>
        </div>
        {tickets.length === 0 ? (
          <p className="text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>Aucun ticket à traiter.</p>
        ) : (
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-4">
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {tickets.map((ticket) => {
                const active = selectedTicket?.id === ticket.id;
                return (
                  <button key={ticket.id} type="button" onClick={() => setSelectedTicketId(ticket.id)} className="w-full rounded-lg p-3 text-left" style={{ background: active ? `${C.primary}22` : C.panel2, border: `1px solid ${active ? C.primary : C.line}` }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.primary, fontFamily: MONO_FONT }}>{ticket.category}</span>
                      <span className="text-[10px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(ticket.createdAt)}</span>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{ticket.title}</p>
                    <p className="text-[11px] mt-1" style={{ color: C.muted, fontFamily: MONO_FONT }}>{ticket.author} · {ticket.status}</p>
                  </button>
                );
              })}
            </div>
            {selectedTicket && (
              <div className="rounded-lg p-3" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{selectedTicket.title}</h3>
                    <p className="text-xs mt-1" style={{ color: C.muted, fontFamily: BODY_FONT }}>{selectedTicket.message}</p>
                  </div>
                  <select value={selectedTicket.status || "open"} onChange={(e) => updateTicketStatus(e.target.value)} className="px-2 py-1 rounded-md text-xs" style={inputStyle}>
                    <option value="open">Ouvert</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Résolu</option>
                  </select>
                </div>
                <div className="space-y-2 mb-3 max-h-[220px] overflow-y-auto pr-1">
                  {(selectedThread?.messages || []).map((message) => (
                    <div key={message.id} className={`rounded-md px-3 py-2 ${message.sender === "admin" ? "ml-4" : "mr-4"}`} style={{ background: message.sender === "admin" ? `${C.primary}22` : `${C.ok}14`, border: `1px solid ${message.sender === "admin" ? C.primary : C.ok}33` }}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{message.author}</span>
                        <span className="text-[10px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(message.createdAt)}</span>
                      </div>
                      <p className="text-xs" style={{ color: C.text, fontFamily: BODY_FONT }}>{message.text}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendAdminReply}>
                  <textarea value={adminReply} onChange={(e) => setAdminReply(e.target.value)} rows={3} placeholder="Répondre en privé à ce membre..." className="w-full px-3 py-2 rounded-md text-sm mb-2" style={inputStyle} />
                  {adminNotice && <p className="text-xs mb-2" style={{ color: C.ok, fontFamily: BODY_FONT }}>{adminNotice}</p>}
                  <PrimaryButton type="submit"><Send size={14} /> Répondre</PrimaryButton>
                </form>
              </div>
            )}
          </div>
        )}
      </Panel>

      <Panel className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: C.muted, fontFamily: BODY_FONT }}>Chiffre d'affaires simulé</span>
          <span className="text-lg font-bold" style={{ color: C.ok, fontFamily: DISPLAY_FONT }}>{totalRevenue}€</span>
        </div>
      </Panel>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Recherche globale — transversale forum / teams / labs / actus / trophées
--------------------------------------------------------------------- */
function GlobalSearchModal({ onClose, setTab, questions, teams, labs, news, trophies }) {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    const out = [];
    questions.forEach((item) => {
      if (item.title.toLowerCase().includes(query) || item.body?.toLowerCase().includes(query)) {
        out.push({ kind: "question", id: item.id, title: item.title, sub: `Question de ${item.author}`, tab: "forum", accent: C.primary, icon: <MessageSquare size={14} /> });
      }
    });
    teams.forEach((item) => {
      if (item.name?.toLowerCase().includes(query)) {
        out.push({ kind: "team", id: item.id, title: item.name, sub: `Team de ${item.owner}`, tab: "equipes", accent: C.warn, icon: <Users size={14} /> });
      }
    });
    labs.forEach((item) => {
      if (item.title?.toLowerCase().includes(query)) {
        out.push({ kind: "lab", id: item.id, title: item.title, sub: `Salon lab de ${item.owner}`, tab: "labs", accent: C.alert, icon: <Bug size={14} /> });
      }
    });
    news.forEach((item) => {
      if (item.title.toLowerCase().includes(query) || item.summary?.toLowerCase().includes(query)) {
        out.push({ kind: "news", id: item.id, title: item.title, sub: "Actualité", tab: "actus", accent: C.gold, icon: <Newspaper size={14} /> });
      }
    });
    trophies.forEach((item) => {
      if (item.title?.toLowerCase().includes(query) || item.platform?.toLowerCase().includes(query)) {
        out.push({ kind: "trophy", id: item.id, title: `${item.platform} — ${item.title}`, sub: `Trophée de ${item.author}`, tab: "trophies", accent: C.gold, icon: <Trophy size={14} /> });
      }
    });
    return out.slice(0, 30);
  }, [q, questions, teams, labs, news, trophies]);

  return (
    <ModalOverlay onClose={onClose}>
      <Panel className="p-4">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-md mb-3" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
          <CrowSearchMascot />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher dans le forum, les teams, les labs, les actus, les trophées..."
            className="w-full bg-transparent outline-none text-sm" style={{ color: C.text, fontFamily: BODY_FONT }} />
          <button onClick={onClose}><X size={16} style={{ color: C.muted }} /></button>
        </div>
        {q.trim().length < 2 ? (
          <p className="text-xs text-center py-6" style={{ color: C.muted, fontFamily: BODY_FONT }}>Tape au moins 2 caractères pour lancer la recherche.</p>
        ) : results.length === 0 ? (
          <EmptyState text="Aucun résultat pour cette recherche." icon={<Eye size={18} />} accent={C.muted} />
        ) : (
          <div className="space-y-1.5 max-h-[50vh] overflow-y-auto">
            {results.map((r) => (
              <button key={`${r.kind}-${r.id}`} onClick={() => { setTab(r.tab); onClose(); }} className="flex items-center gap-2.5 w-full text-left px-2.5 py-2 rounded-md transition-colors hover:opacity-90" style={{ background: C.panel2 }}>
                <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ background: `${r.accent}1A`, color: r.accent }}>{r.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate" style={{ color: C.text, fontFamily: BODY_FONT }}>{r.title}</p>
                  <p className="text-[11px] truncate" style={{ color: C.muted, fontFamily: MONO_FONT }}>{r.sub}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Panel>
    </ModalOverlay>
  );
}

/* ---------------------------------------------------------------------
   Centre de notifications — cloche du header
--------------------------------------------------------------------- */
function NotificationBell({ currentUser, questions, teams, labs, notifications = [], setTab }) {
  const [open, setOpen] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const res = await window.storage.get(`gowlsec:notif_seen:${currentUser.id}`, false);
        if (res?.value) setLastSeen(res.value);
      } catch { /* best effort */ }
    })();
  }, [currentUser?.id]);

  useEffect(() => {
    function onDocClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const items = useMemo(() => {
    if (!currentUser) return [];
    const out = [];
    questions.filter((q) => q.author === currentUser.username).forEach((q) => {
      (q.answers || []).filter((a) => a.author !== currentUser.username).forEach((a) => {
        out.push({ id: `answer-${a.id}`, text: `${a.author} a répondu à ta question « ${q.title} »`, createdAt: a.createdAt, tab: "forum", icon: <MessageSquare size={13} />, accent: C.primary });
      });
    });
    teams.filter((t) => t.owner === currentUser.username).forEach((t) => {
      (t.members || []).filter((m) => m !== currentUser.username).forEach((m) => {
        out.push({ id: `team-${t.id}-${m}`, text: `${m} a rejoint ta team ${t.name}`, createdAt: t.createdAt, tab: "equipes", icon: <Users size={13} />, accent: C.warn });
      });
    });
    labs.filter((l) => l.owner === currentUser.username).forEach((l) => {
      (l.members || []).filter((m) => m !== currentUser.username).forEach((m) => {
        out.push({ id: `lab-${l.id}-${m}`, text: `${m} a rejoint ton salon lab ${l.title}`, createdAt: l.createdAt, tab: "labs", icon: <Bug size={13} />, accent: C.alert });
      });
    });
    notifications
      .filter((n) => !n.targetUserId || n.targetUserId === currentUser.id)
      .forEach((n) => {
        const cat = NEWS_CATEGORIES.find((c) => c.key === n.category) || NEWS_CATEGORIES[1];
        const Icon = cat.icon || Mail;
        out.push({
          id: `notif-${n.id}`,
          text: n.targetUserId ? n.title : `${n.title}`,
          sub: n.message,
          createdAt: n.createdAt,
          tab: n.category === "event" ? "evenements" : "actus",
          icon: <Icon size={13} />,
          accent: cat.color,
        });
      });
    return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 30);
  }, [currentUser, questions, teams, labs, notifications]);

  const unreadCount = useMemo(() => {
    if (!lastSeen) return items.length;
    return items.filter((n) => new Date(n.createdAt) > new Date(lastSeen)).length;
  }, [items, lastSeen]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && currentUser) {
      const now = new Date().toISOString();
      setLastSeen(now);
      try { await window.storage.set(`gowlsec:notif_seen:${currentUser.id}`, now, false); } catch { /* best effort */ }
    }
  }

  if (!currentUser) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={toggle} title="Boîte aux hiboux" className="relative w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.panel2, border: `1px solid ${C.line}` }}>
        <OwlLogo size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: C.alert, color: "#fff", fontFamily: MONO_FONT }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-80 max-w-[90vw] rounded-xl z-40 overflow-hidden gowl-fade-up" style={{ background: C.panel, border: `1px solid ${C.line}`, boxShadow: "0 16px 40px -12px rgba(0,0,0,0.65)" }}>
          <div className="px-3.5 py-3 flex items-center gap-2.5" style={{ borderBottom: `1px solid ${C.line}`, background: `linear-gradient(155deg, ${C.primary}14, transparent)` }}>
            <OwlLogo size={20} />
            <div className="min-w-0">
              <span className="text-xs font-bold" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>Boîte aux hiboux</span>
              <p className="text-[10px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>Tes notifications GowlSec</p>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-8 px-4">
                <OwlLogo size={26} />
                <p className="text-xs mt-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>Le hibou n'a rien apporté pour l'instant.</p>
              </div>
            ) : items.map((n) => (
              <button key={n.id} onClick={() => { setTab(n.tab); setOpen(false); }} className="flex items-start gap-2.5 w-full text-left px-3.5 py-2.5 transition-colors hover:opacity-90" style={{ borderBottom: `1px solid ${C.line}` }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${n.accent}1A`, color: n.accent }}>{n.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-snug font-semibold" style={{ color: C.text, fontFamily: BODY_FONT }}>{n.text}</p>
                  {n.sub && <p className="text-[11px] leading-snug mt-0.5" style={{ color: C.muted, fontFamily: BODY_FONT }}>{n.sub}</p>}
                  <span className="text-[10px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>{timeAgo(n.createdAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Write-ups communautaires — résolutions de labs partagées
--------------------------------------------------------------------- */
function WriteupsTab({ pseudo, writeups, setWriteups, isAdmin, currentUser = null }) {
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState(DIFFICULTIES[0].key);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [link, setLink] = useState("");
  const [expanded, setExpanded] = useState({});

  async function submit(e) {
    e.preventDefault();
    if (!currentUser || !title.trim() || !content.trim()) return;
    const w = { id: uid(), author: pseudo, platform, title: title.trim(), difficulty, summary: summary.trim(), content: content.trim(), link: link.trim(), createdAt: new Date().toISOString() };
    const next = [w, ...writeups];
    setWriteups(next);
    saveCollection("gowlsec:writeups", next);
    setTitle(""); setSummary(""); setContent(""); setLink(""); setDifficulty(DIFFICULTIES[0].key); setShowForm(false);
  }
  function remove(id) {
    const next = writeups.filter((w) => w.id !== id);
    setWriteups(next);
    saveCollection("gowlsec:writeups", next);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <SectionHeader icon={<FileText size={19} />} eyebrow="Community content" title="Write-ups" subtitle="Résolutions de labs (HTB, TryHackMe, Root-Me...) partagées par la communauté." accent={C.primary} />
        {!currentUser ? (
          <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent("open-auth-login"))}>Connexion</PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => setShowForm((s) => !s)}>{showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? "Annuler" : "Publier un write-up"}</PrimaryButton>
        )}
      </div>
      {!currentUser && <GuestGate text="Connecte-toi pour publier un write-up." accent={C.primary} />}
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <CreationHero scene={<LabScene />} accent={C.primary} eyebrow="Nouveau write-up" title="Partage ta résolution" subtitle="Détaille ta méthodologie une fois le lab validé : ça aide toute la communauté à progresser." onClose={() => setShowForm(false)}>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-2.5">
                <Field label="Plateforme">
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle}>
                    {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Nom du lab / challenge"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Blue, Vulnversity..." className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              </div>
              <Field label="Difficulté">
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button type="button" key={d.key} onClick={() => setDifficulty(d.key)} style={{ opacity: difficulty === d.key ? 1 : 0.5 }}><Chip label={d.label} color={d.color} /></button>
                  ))}
                </div>
              </Field>
              <Field label="Résumé (1-2 lignes)"><input value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              <Field label="Méthodologie / write-up complet"><textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} placeholder="Reconnaissance, énumération, exploitation, élévation de privilèges..." className="w-full px-2.5 py-1.75 rounded-md text-sm resize-none" style={inputStyle} /></Field>
              <Field label="Lien externe (optionnel)"><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              <PrimaryButton type="submit"><CheckCircle2 size={14} /> Publier</PrimaryButton>
            </form>
          </CreationHero>
        </ModalOverlay>
      )}
      <div className="space-y-3">
        {writeups.length === 0 && <EmptyState icon={<FileText size={20} />} accent={C.primary} text="Aucun write-up publié pour le moment. Sois le premier à partager une résolution !" />}
        {writeups.map((w) => {
          const d = DIFFICULTIES.find((x) => x.key === w.difficulty) || DIFFICULTIES[0];
          const isOpen = !!expanded[w.id];
          return (
            <Panel key={w.id} className="p-4">
              {isAdmin && <button onClick={() => remove(w.id)} className="absolute top-3 right-3 z-10" style={{ color: C.alert }}><Trash2 size={13} /></button>}
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-[10px] uppercase gowl-mono-tag" style={{ color: C.muted }}>{w.platform}</span>
                <Chip label={d.label} color={d.color} />
              </div>
              <h3 className="font-semibold text-sm mb-1" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{w.title}</h3>
              {w.summary && <p className="text-xs mb-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>{w.summary}</p>}
              {isOpen && (
                <div className="mt-2 p-3 rounded-md whitespace-pre-wrap text-xs" style={{ background: C.panel2, color: C.text, fontFamily: BODY_FONT }}>{w.content}</div>
              )}
              <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
                <span className="text-xs" style={{ color: C.primary, fontFamily: MONO_FONT }}>{w.author} · {timeAgo(w.createdAt)}</span>
                <div className="flex items-center gap-2">
                  {w.link && <a href={w.link} target="_blank" rel="noreferrer"><GhostButton><ExternalLink size={11} /> Lien</GhostButton></a>}
                  <GhostButton onClick={() => setExpanded((e) => ({ ...e, [w.id]: !e[w.id] }))}>{isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {isOpen ? "Réduire" : "Lire"}</GhostButton>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   Calendrier d'événements — CTF, coachings boutique, lives Discord
--------------------------------------------------------------------- */
function timeUntil(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "en cours / passé";
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `dans ${days} j`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `dans ${hours} h`;
  return `dans ${Math.max(1, Math.floor(diff / 60000))} min`;
}
function EventsTab({ pseudo, events, setEvents, isAdmin, currentUser = null }) {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(EVENT_TYPES[0].key);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!currentUser || !title.trim() || !date) return;
    const ev = { id: uid(), author: pseudo, title: title.trim(), type, date: new Date(date).toISOString(), description: description.trim(), link: link.trim(), createdAt: new Date().toISOString() };
    const next = [ev, ...events];
    setEvents(next);
    saveCollection("gowlsec:events", next);
    setTitle(""); setDate(""); setDescription(""); setLink(""); setType(EVENT_TYPES[0].key); setShowForm(false);
  }
  function remove(id) {
    const next = events.filter((e) => e.id !== id);
    setEvents(next);
    saveCollection("gowlsec:events", next);
  }

  const sorted = useMemo(() => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)), [events]);
  const upcoming = sorted.filter((e) => new Date(e.date).getTime() >= Date.now());
  const past = sorted.filter((e) => new Date(e.date).getTime() < Date.now());

  function EventCard({ e }) {
    const et = EVENT_TYPES.find((x) => x.key === e.type) || EVENT_TYPES[0];
    return (
      <Panel className="p-4 relative" style={{ borderColor: `${et.color}44` }}>
        {isAdmin && <button onClick={() => remove(e.id)} className="absolute top-3 right-3 z-10" style={{ color: C.alert }}><Trash2 size={13} /></button>}
        <div className="flex items-center gap-2 mb-1.5">
          <Chip label={et.label} color={et.color} />
          <span className="text-[11px]" style={{ color: C.muted, fontFamily: MONO_FONT }}>{new Date(e.date).toLocaleString("fr-FR")}</span>
        </div>
        <h3 className="font-semibold text-sm mb-1" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{e.title}</h3>
        {e.description && <p className="text-xs mb-2" style={{ color: C.muted, fontFamily: BODY_FONT }}>{e.description}</p>}
        <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: `1px solid ${C.line}` }}>
          <span className="text-xs font-semibold" style={{ color: et.color, fontFamily: MONO_FONT }}>{timeUntil(e.date)}</span>
          {e.link && <a href={e.link} target="_blank" rel="noreferrer"><GhostButton><ExternalLink size={11} /> Détails</GhostButton></a>}
        </div>
      </Panel>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <SectionHeader icon={<Calendar size={19} />} eyebrow="Community" title="Événements" subtitle="CTF à venir, sessions de coaching de la boutique, lives Discord." accent={C.gold} />
        {!currentUser ? (
          <PrimaryButton onClick={() => window.dispatchEvent(new CustomEvent("open-auth-login"))}>Connexion</PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => setShowForm((s) => !s)}>{showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? "Annuler" : "Ajouter un événement"}</PrimaryButton>
        )}
      </div>
      {!currentUser && <GuestGate text="Connecte-toi pour proposer un événement." accent={C.gold} />}
      {showForm && (
        <ModalOverlay onClose={() => setShowForm(false)}>
          <CreationHero scene={<TrophyScene />} accent={C.gold} eyebrow="Nouvel événement" title="Fédère la communauté autour d'un rendez-vous" subtitle="CTF, coaching, live Discord... donne date et lieu." onClose={() => setShowForm(false)}>
            <form onSubmit={submit} className="space-y-3">
              <Field label="Titre"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : CTFtime — Cyber Apocalypse" className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              <Field label="Type">
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map((t) => (
                    <button type="button" key={t.key} onClick={() => setType(t.key)} style={{ opacity: type === t.key ? 1 : 0.5 }}><Chip label={t.label} color={t.color} /></button>
                  ))}
                </div>
              </Field>
              <Field label="Date et heure"><input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              <Field label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-2.5 py-1.75 rounded-md text-sm resize-none" style={inputStyle} /></Field>
              <Field label="Lien (optionnel)"><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="w-full px-2.5 py-1.75 rounded-md text-sm" style={inputStyle} /></Field>
              <PrimaryButton type="submit"><CheckCircle2 size={14} /> Publier l'événement</PrimaryButton>
            </form>
          </CreationHero>
        </ModalOverlay>
      )}
      <div className="mb-2">
        <span className="text-[10px] font-bold uppercase gowl-mono-tag" style={{ color: C.muted }}>À venir</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {upcoming.length === 0 && <EmptyState icon={<Calendar size={20} />} accent={C.gold} text="Aucun événement à venir pour le moment." />}
        {upcoming.map((e) => <EventCard key={e.id} e={e} />)}
      </div>
      {past.length > 0 && (
        <>
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase gowl-mono-tag" style={{ color: C.muted }}>Passés</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
            {past.slice(0, 6).map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Parcours guidés — labs + ressources + défis regroupés en chemin structuré
--------------------------------------------------------------------- */
function LearningPathsTab({ currentUser, setTab }) {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const res = await window.storage.get(`gowlsec:paths_progress:${currentUser.id}`, false);
        if (res?.value) setProgress(JSON.parse(res.value));
      } catch { /* best effort */ }
    })();
  }, [currentUser?.id]);

  async function toggleStep(stepId) {
    if (!currentUser) return;
    const next = { ...progress, [stepId]: !progress[stepId] };
    setProgress(next);
    saveCollection(`gowlsec:paths_progress:${currentUser.id}`, next, false);
  }

  return (
    <div>
      <SectionHeader icon={<Compass size={19} />} eyebrow="Guided learning" title="Parcours guidés" subtitle="Labs, ressources et défis regroupés en chemins structurés pour progresser étape par étape." accent={C.ok} />
      {!currentUser && <GuestGate text="Connecte-toi pour suivre ta progression sur les parcours." accent={C.ok} />}
      <div className="grid md:grid-cols-2 gap-4 mt-5">
        {LEARNING_PATHS.map((path) => {
          const done = path.steps.filter((s) => progress[s.id]).length;
          const pct = Math.round((done / path.steps.length) * 100);
          return (
            <Panel key={path.key} className="p-4" style={{ borderColor: `${path.accent}44` }}>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-bold text-sm" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{path.title}</h3>
                <span className="text-xs font-bold" style={{ color: path.accent, fontFamily: MONO_FONT }}>{done}/{path.steps.length}</span>
              </div>
              <p className="text-xs mb-3" style={{ color: C.muted, fontFamily: BODY_FONT }}>{path.desc}</p>
              <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ background: C.panel2 }}>
                <div className="h-full rounded-full gowl-bar-fill" style={{ width: `${pct}%`, background: path.accent }} />
              </div>
              <div className="space-y-1.5">
                {path.steps.map((s) => (
                  <div key={s.id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md" style={{ background: C.panel2 }}>
                    <button onClick={() => toggleStep(s.id)} disabled={!currentUser} className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: progress[s.id] ? path.accent : "transparent", border: `1px solid ${progress[s.id] ? path.accent : C.line}` }}>
                      {progress[s.id] && <CheckCircle2 size={12} color="#fff" />}
                    </button>
                    <button onClick={() => setTab(s.tab)} className="text-xs text-left flex-1" style={{ color: progress[s.id] ? C.muted : C.text, textDecoration: progress[s.id] ? "line-through" : "none", fontFamily: BODY_FONT }}>{s.label}</button>
                  </div>
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   App shell
--------------------------------------------------------------------- */
const TABS = [
  { key: "accueil", label: "Accueil", icon: Compass, primary: true },
  { key: "actus", label: "Actualités", icon: Newspaper, primary: true },
  { key: "forum", label: "Question", icon: MessageSquare, primary: true },
  { key: "salons", label: "Hub", icon: Hash, primary: true },
  { key: "equipes", label: "Team", icon: Users },
  { key: "labs", label: "Labs", icon: FlaskConical, primary: true },
  { key: "classement", label: "Classement", icon: TrendingUp, primary: true },
  { key: "trophies", label: "Trophées", icon: Trophy },
  { key: "writeups", label: "Write-ups", icon: BookOpen },
  { key: "evenements", label: "Événements", icon: Calendar, primary: true },
  { key: "parcours", label: "Parcours", icon: MapPin },
  { key: "boutique", label: "Boutique", icon: ShoppingCart },
  { key: "assistant", label: "Assistant IA", icon: Bot },
  { key: "support", label: "Support", icon: MessageCircle },
  { key: "admin", label: "Admin", icon: Shield },
];

export default function GowlSec() {
  const [tab, setTab] = useState("accueil");
  const { user, setUser, logout } = useAuth();
  const currentUser = user;
  const setCurrentUser = setUser;
  const [guestPseudo] = useState("invite" + Math.floor(Math.random() * 900 + 100));
  const [isAdmin, setIsAdmin] = useState(false);

  const [lang, setLang] = useState(null);
  const [langLoading, setLangLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("gowlsec:lang", false);
        if (res?.value) setLang(res.value);
      } catch {
        /* best effort */
      }
      setLangLoading(false);
    })();
  }, []);

  async function chooseLang(key) {
    setLang(key);
    try {
      await window.storage.set("gowlsec:lang", key, false);
    } catch {
      /* best effort */
    }
  }
  const L = (key) => t(lang || "fr", key);

  const [profiles, setProfiles] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [news, setNews] = useState(SEED_NEWS);
  const [teams, setTeams] = useState([]);
  const [teamAnnouncements, setTeamAnnouncements] = useState([]);
  const [labs, setLabs] = useState([]);
  const [labMessages, setLabMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [supportThreads, setSupportThreads] = useState([]);
  const [writeups, setWriteups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveCount, setLiveCount] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const pseudo = currentUser?.username || guestPseudo;

  useEffect(() => {
    if (currentUser && (currentUser.role === "admin" || currentUser.isAdmin === true)) {
      setIsAdmin(true);
    }
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    async function refreshLive() {
      try {
        const listing = await window.storage.list("gowlsec:presence:", true);
        const keys = listing?.keys || [];
        const results = await Promise.all(keys.map(async (k) => {
          try {
            const r = await window.storage.get(k, true);
            return r ? JSON.parse(r.value) : null;
          } catch { return null; }
        }));
        if (!active) return;
        const now = Date.now();
        setLiveCount(results.filter(Boolean).filter((p) => now - new Date(p.lastSeen).getTime() < ONLINE_WINDOW_MS).length);
      } catch { /* best effort */ }
    }
    refreshLive();
    const interval = setInterval(refreshLive, 30000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    (async () => {
      const [pr, cr, q, m, t, n, tm, ta, ord, lb, lm, tk, th, wu, ev, nf] = await Promise.all([
        loadCollection("gowlsec:profiles", []),
        loadCollection("gowlsec:credentials", [], false),
        loadCollection("gowlsec:questions", []),
        loadCollection("gowlsec:chat", []),
        loadCollection("gowlsec:trophies", []),
        loadCollection("gowlsec:news", SEED_NEWS),
        loadCollection("gowlsec:teams", []),
        loadCollection("gowlsec:team_announcements", []),
        loadCollection("gowlsec:orders", []),
        loadCollection("gowlsec:labs", []),
        loadCollection("gowlsec:lab_messages", []),
        loadCollection("gowlsec:tickets", []),
        loadCollection("gowlsec:support_threads", []),
        loadCollection("gowlsec:writeups", []),
        loadCollection("gowlsec:events", []),
        loadCollection("gowlsec:notifications", []),
      ]);
      setProfiles(pr); setCredentials(cr); setQuestions(q); setMessages(m); setTrophies(t); setNews(n);
      setTeams(tm); setTeamAnnouncements(ta); setOrders(ord); setLabs(lb); setLabMessages(lm); setTickets(tk); setSupportThreads(th);
      setWriteups(wu); setEvents(ev); setNotifications(nf);

      try {
        const sessionRes = await window.storage.get("gowlsec:session", false);
        if (sessionRes?.value) {
          const session = JSON.parse(sessionRes.value);
          const savedProfile = pr.find((p) => p.id === session.profileId);
          if (savedProfile) setCurrentUser(savedProfile);
        }
      } catch { /* best effort */ }

      setLoading(false);
    })();
  }, []);

  // présence — heartbeat pour le suivi admin des utilisateurs connectés
  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    async function heartbeat() {
      if (!active) return;
      await saveCollection(`gowlsec:presence:${currentUser.id}`, {
        userId: currentUser.id, username: currentUser.username, email: currentUser.email, lastSeen: new Date().toISOString(),
      }, true);
    }
    heartbeat();
    const interval = setInterval(heartbeat, 25000);
    return () => { active = false; clearInterval(interval); };
  }, [currentUser]);

  const stats = useMemo(() => ({ questions: questions.length, messages: messages.length, trophies: trophies.length, news: news.length, teams: teams.length, labs: labs.length, tickets: tickets.length }), [questions, messages, trophies, news, teams, labs, tickets]);
  const announcements = useMemo(() => news.filter((n) => n.category === "annonce").slice(0, 3), [news]);

  const featuredNews = useMemo(() => {
    const pool = news.filter((n) => n.category !== "annonce");
    const list = pool.length > 0 ? pool : news;
    if (list.length === 0) return null;
    return list[dayOfYear() % list.length];
  }, [news]);

  const activityFeed = useMemo(() => {
    const items = [
      ...questions.map((q) => ({ kind: "question", id: q.id, author: q.author, text: q.title, createdAt: q.createdAt, tab: "forum" })),
      ...trophies.map((t) => ({ kind: "trophy", id: t.id, author: t.author, text: `${t.platform} — ${t.title}`, createdAt: t.createdAt, tab: "trophies" })),
      ...teams.map((t) => ({ kind: "team", id: t.id, author: t.owner, text: `a créé la team ${t.name}`, createdAt: t.createdAt, tab: "equipes" })),
      ...labs.map((l) => ({ kind: "lab", id: l.id, author: l.owner, text: `a ouvert le salon lab ${l.title}`, createdAt: l.createdAt, tab: "labs" })),
      ...messages.slice(-30).map((m) => ({ kind: "message", id: m.id, author: m.author, text: m.text, createdAt: m.createdAt, tab: "salons" })),
    ];
    return items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 7);
  }, [questions, trophies, teams, labs, messages]);

  const topLeaders = useMemo(() => {
    const scores = {};
    const add = (author, pts) => { if (!author) return; scores[author] = (scores[author] || 0) + pts; };
    trophies.forEach((t) => add(t.author, TROPHY_POINTS[t.difficulty] || 10));
    questions.forEach((q) => { add(q.author, 2); (q.answers || []).forEach((a) => add(a.author, 3)); });
    labs.forEach((l) => add(l.owner, 5));
    return Object.entries(scores).map(([author, total]) => ({ author, total })).sort((a, b) => b.total - a.total).slice(0, 3);
  }, [questions, trophies, labs]);

  const openLabs = useMemo(() => labs.filter((l) => l.members.length < (l.maxMembers || LAB_MAX_MEMBERS)).slice(0, 3), [labs]);

  const tickerItems = useMemo(() => {
    const fromActivity = activityFeed.map((item) => {
      const verbs = { question: "a posé une question", trophy: "a débloqué un trophée", team: "a créé une team", lab: "a ouvert un salon lab", message: "discute sur le Hub" };
      return `${item.author} ${verbs[item.kind] || "vient d'agir"}`;
    });
    const fromNews = news.slice(0, 4).map((n) => `📰 ${n.title}`);
    const combined = [...fromActivity, ...fromNews];
    if (combined.length === 0) {
      return ["Bienvenue sur GowlSec — la communauté démarre tout juste", "Pose ta première question dans #Question", "Ouvre un salon lab et avance à plusieurs"];
    }
    return combined;
  }, [activityFeed, news]);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: BODY_FONT, position: "relative" }}>
      {!langLoading && !lang && <LanguageGate onChoose={chooseLang} />}
      {searchOpen && (
        <GlobalSearchModal onClose={() => setSearchOpen(false)} setTab={setTab} questions={questions} teams={teams} labs={labs} news={news} trophies={trophies} />
      )}
      <div aria-hidden className="gowl-bg-grid" />
      <div aria-hidden className="gowl-bg-glow" />
      <NetworkBackground />
      <div aria-hidden className="gowl-scanlines" />
      <div aria-hidden className="gowl-bg-noise" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        /* --- Fond cyber ambiant : grille + halos --- */
        .gowl-bg-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(${C.line}2A 1px, transparent 1px),
            linear-gradient(90deg, ${C.line}2A 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%);
        }
        .gowl-bg-glow {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(600px 340px at 12% -6%, ${C.primary}1C, transparent 60%),
            radial-gradient(560px 320px at 92% 8%, ${C.ok}16, transparent 60%),
            radial-gradient(700px 420px at 50% 100%, ${C.gold}0F, transparent 70%);
        }
        .gowl-bg-network { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.85; }
        header, main, footer { position: relative; z-index: 1; }
        /* --- Éléments HUD cyber réutilisables --- */
        @keyframes gowl-border-glow { 0%, 100% { box-shadow: 0 0 0 1px var(--gowl-accent, ${C.primary})33, 0 0 18px -6px var(--gowl-accent, ${C.primary})55; } 50% { box-shadow: 0 0 0 1px var(--gowl-accent, ${C.primary})66, 0 0 26px -4px var(--gowl-accent, ${C.primary})AA; } }
        .gowl-hud-card { position: relative; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; }
        .gowl-hud-card:hover { transform: translateY(-2px); border-color: var(--gowl-accent, ${C.primary})77 !important; box-shadow: 0 14px 28px -20px var(--gowl-accent, ${C.primary})AA, 0 0 0 1px var(--gowl-accent, ${C.primary})33; }
        .gowl-hud-card::before, .gowl-hud-card::after {
          content: ""; position: absolute; width: 10px; height: 10px; pointer-events: none; opacity: 0; transition: opacity 0.2s ease;
          border-color: var(--gowl-accent, ${C.primary});
        }
        .gowl-hud-card::before { top: -1px; left: -1px; border-top: 2px solid; border-left: 2px solid; }
        .gowl-hud-card::after { bottom: -1px; right: -1px; border-bottom: 2px solid; border-right: 2px solid; }
        .gowl-hud-card:hover::before, .gowl-hud-card:hover::after { opacity: 1; }
        .gowl-section-head { position: relative; display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
        .gowl-section-icon { position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; border-radius: 12px; flex-shrink: 0; background: linear-gradient(155deg, var(--gowl-accent, ${C.primary})26, transparent); border: 1px solid var(--gowl-accent, ${C.primary})55; color: var(--gowl-accent, ${C.primary}); animation: gowl-border-glow 3s ease-in-out infinite; }
        .gowl-section-rule { height: 2px; flex: 1; margin-left: 14px; background: linear-gradient(90deg, var(--gowl-accent, ${C.primary})88, transparent); border-radius: 2px; }
        .gowl-mono-tag { font-family: ${MONO_FONT}; letter-spacing: 0.14em; }
        @keyframes gowl-podium-rise { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
        .gowl-podium-bar { transform-origin: bottom; animation: gowl-podium-rise 0.6s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes gowl-rank-glow { 0%, 100% { filter: drop-shadow(0 0 2px currentColor); } 50% { filter: drop-shadow(0 0 9px currentColor); } }
        .gowl-rank-glow { animation: gowl-rank-glow 2.2s ease-in-out infinite; }
        .gowl-trophy-badge { position: relative; width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
        @keyframes gowl-sweep { 0% { transform: translateX(-120%) skewX(-15deg); } 100% { transform: translateX(220%) skewX(-15deg); } }
        .gowl-sweep-wrap { position: relative; overflow: hidden; }
        .gowl-sweep-wrap::after { content: ""; position: absolute; top: 0; left: 0; width: 40%; height: 100%; background: linear-gradient(90deg, transparent, #ffffff22, transparent); animation: gowl-sweep 3.2s ease-in-out infinite; pointer-events: none; }

        /* --- Vague 2 : effets premium --- */
        @keyframes gowl-noise-shift { 0% { transform: translate(0,0); } 100% { transform: translate(-40px,-30px); } }
        .gowl-bg-noise { position: fixed; inset: -60px; z-index: 0; pointer-events: none; opacity: 0.05; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          animation: gowl-noise-shift 1.2s steps(2) infinite; }
        @keyframes gowl-scanline-move { 0% { background-position-y: 0; } 100% { background-position-y: 240px; } }
        .gowl-scanlines { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.5;
          background: repeating-linear-gradient(0deg, transparent 0 3px, #ffffff05 3px 4px);
          animation: gowl-scanline-move 9s linear infinite; }
        @keyframes gowl-glitch-1 { 0%, 92%, 100% { transform: translate(0,0); opacity: 0; } 93% { transform: translate(-2px,1px); opacity: 0.7; } 95% { transform: translate(2px,-1px); opacity: 0.5; } 97% { transform: translate(-1px,0); opacity: 0.3; } }
        .gowl-glitch { position: relative; }
        .gowl-glitch::before, .gowl-glitch::after { content: attr(data-text); position: absolute; inset: 0; opacity: 0; pointer-events: none; }
        .gowl-glitch::before { color: ${C.alert}; animation: gowl-glitch-1 5s infinite; clip-path: inset(0 0 55% 0); }
        .gowl-glitch::after { color: ${C.ok}; animation: gowl-glitch-1 5s infinite reverse; clip-path: inset(55% 0 0 0); }
        @keyframes gowl-conic-spin { to { transform: rotate(360deg); } }
        .gowl-rank-ring { position: relative; display: inline-flex; border-radius: 999px; padding: 3px; }
        .gowl-rank-ring::before { content: ""; position: absolute; inset: 0; border-radius: 999px; padding: 2px;
          background: conic-gradient(from 0deg, var(--gowl-accent, ${C.gold}), transparent 40%, var(--gowl-accent, ${C.gold}));
          animation: gowl-conic-spin 3.5s linear infinite;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude; }
        @keyframes gowl-crown-float { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-5px) rotate(3deg); } }
        .gowl-crown-float { animation: gowl-crown-float 2.4s ease-in-out infinite; filter: drop-shadow(0 0 6px ${C.gold}CC); }
        @keyframes gowl-podium-glow-1 { 0%, 100% { opacity: 0.55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.15); } }
        .gowl-podium-spot { position: absolute; border-radius: 999px; filter: blur(24px); animation: gowl-podium-glow-1 3s ease-in-out infinite; pointer-events: none; }
        .gowl-glass { backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); background: linear-gradient(165deg, ${C.panel}F2, ${C.panel2}D9) !important; }
        .gowl-inner-line { position: absolute; top: 0; left: 12px; right: 12px; height: 1px; background: linear-gradient(90deg, transparent, #ffffff22, transparent); pointer-events: none; }
        @keyframes gowl-bar-fill { from { width: 0; } }
        .gowl-bar-fill { animation: gowl-bar-fill 0.8s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes gowl-count-pop { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .gowl-count-pop { animation: gowl-count-pop 0.4s cubic-bezier(.34,1.56,.64,1) both; }
        .gowl-live-dot { position: relative; width: 7px; height: 7px; border-radius: 999px; background: ${C.alert}; display: inline-block; }
        .gowl-live-dot::after { content: ""; position: absolute; inset: -4px; border-radius: 999px; border: 1px solid currentColor; animation: gowl-ping-ring 1.6s ease-out infinite; }
        .gowl-medal-pop { display: inline-block; animation: gowl-count-pop 0.5s cubic-bezier(.34,1.56,.64,1) both; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 4px; }
        * { scrollbar-color: ${C.line} transparent; }
        @keyframes gowl-pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
        @keyframes gowl-ping-ring { 0% { transform: scale(0.9); opacity: 0.7; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes gowl-blob-drift { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(20px, -24px) scale(1.08); } 66% { transform: translate(-16px, 14px) scale(0.96); } }
        @keyframes gowl-ticker-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes gowl-fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gowl-glow-pulse { 0%, 100% { box-shadow: 0 0 0 0 ${C.primary}55; } 50% { box-shadow: 0 0 0 6px ${C.primary}00; } }
        .gowl-fade-up { animation: gowl-fade-up 0.5s ease both; }
        .gowl-ticker-track { animation: gowl-ticker-scroll 26s linear infinite; }
        .gowl-ticker-track:hover { animation-play-state: paused; }
        .gowl-navcard { transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease; }
        .gowl-navcard:hover { transform: translateY(-3px); border-color: ${C.primary}88 !important; background: ${C.panel2} !important; }
        .gowl-navcard:hover .gowl-navcard-icon { transform: scale(1.1) rotate(-4deg); }
        .gowl-navcard-icon { transition: transform 0.2s ease; }
        .gowl-cta-glow { animation: gowl-glow-pulse 2.4s ease-in-out infinite; }
        @keyframes gowl-scan-beam { 0% { top: 0%; opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        @keyframes gowl-eye-scan { 0%, 100% { transform: translateX(-2.5px); } 50% { transform: translateX(2.5px); } }
        @keyframes gowl-mascot-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes gowl-digit-flicker { 0%, 100% { opacity: var(--gowl-op, 0.3); } 50% { opacity: 0.05; } }
        @keyframes gowl-crow-fly { 0% { transform: translate(-46%, 10px) rotate(-4deg); } 22% { transform: translate(-16%, -20px) rotate(3deg); } 50% { transform: translate(22%, 8px) rotate(-3deg); } 76% { transform: translate(42%, -16px) rotate(4deg); } 100% { transform: translate(-46%, 10px) rotate(-4deg); } }
        @keyframes gowl-wing-flap-left { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(38deg); } }
        @keyframes gowl-wing-flap-right { 0%, 100% { transform: rotate(8deg); } 50% { transform: rotate(-38deg); } }
        .gowl-crow-fly-wrap { position: absolute; left: 50%; top: 40%; margin-left: -44px; margin-top: -44px; animation: gowl-crow-fly 9s ease-in-out infinite; }
        .gowl-wing { transform-box: fill-box; }
        .gowl-wing-left { transform-origin: 88% 50%; animation: gowl-wing-flap-left 0.55s ease-in-out infinite; }
        .gowl-wing-right { transform-origin: 12% 50%; animation: gowl-wing-flap-right 0.55s ease-in-out infinite; }
        .gowl-eye-pupil { animation: gowl-eye-scan 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .gowl-mascot-wrap { animation: gowl-mascot-bob 3.2s ease-in-out infinite; }
        .gowl-digit { animation: gowl-digit-flicker 4s ease-in-out infinite; animation-delay: var(--gowl-delay, 0s); }
        @keyframes gowl-scene-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        .gowl-scene-float { animation: gowl-scene-float 3.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes gowl-shield-glow { 0%, 100% { filter: drop-shadow(0 0 0px ${C.alert}); } 50% { filter: drop-shadow(0 0 6px ${C.alert}AA); } }
        .gowl-shield-glow { animation: gowl-shield-glow 2.4s ease-in-out infinite; }
        @keyframes gowl-cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.15; } }
        .gowl-cursor-blink { animation: gowl-cursor-blink 1s steps(2) infinite; }
      `}</style>

      <header className="sticky top-0 z-30" style={{ background: `${C.bg}F2`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${C.line}`, boxShadow: "0 1px 0 rgba(0,0,0,0.4), 0 8px 24px -16px rgba(0,0,0,0.6)" }}>
        <div aria-hidden style={{ height: 2, background: `linear-gradient(90deg, ${C.primary}, ${C.gold}, ${C.ok})`, opacity: 0.7 }} />
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[70px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 min-w-0">
            <button onClick={() => setTab("accueil")} className="flex items-center gap-2.5 shrink-0 group">
              <span className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-transform group-hover:scale-105" style={{ background: `linear-gradient(155deg, ${C.panel2}, ${C.bg})`, border: `1px solid ${C.line}`, boxShadow: `0 0 0 1px ${C.primary}22 inset` }}>
                <OwlLogo size={20} />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-extrabold text-lg tracking-tight" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>GowlSec</span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: C.muted, fontFamily: MONO_FONT }}>{L("tagline")}</span>
              </span>
            </button>
            <span className="hidden lg:block w-px h-7 shrink-0" style={{ background: C.line }} />
            <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto py-1">
              {TABS.filter((t) => t.key !== "admin" && t.primary).map((t) => {
                const active = tab === t.key;
                const Icon = t.icon;
                return (
                  <button key={t.key} onClick={() => setTab(t.key)} className="relative flex items-center gap-1.5 px-3 py-[7px] text-[13px] font-semibold whitespace-nowrap rounded-lg transition-all duration-200"
                    style={{
                      color: active ? "#fff" : C.muted,
                      background: active ? `linear-gradient(155deg, ${C.primary}, ${C.primary}CC)` : "transparent",
                      boxShadow: active ? `0 4px 14px -4px ${C.primary}88` : "none",
                      fontFamily: BODY_FONT,
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = C.panel2; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    {Icon && <Icon size={13} />}
                    {(I18N[lang || "fr"].tabs[t.key]) || t.label}
                  </button>
                );
              })}
              <NavMoreMenu tabs={TABS.filter((t) => t.key !== "admin" && !t.primary)} tab={tab} setTab={setTab} lang={lang} />
            </nav>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            {isAdmin && (
              <button onClick={() => setTab("admin")} className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold" style={{ background: `${C.gold}14`, border: `1px solid ${C.gold}44`, color: C.gold, fontFamily: MONO_FONT }}>
                <Shield size={12} /> {L("admin")}
              </button>
            )}
            <button onClick={() => setSearchOpen(true)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.panel2, border: `1px solid ${C.line}` }} title="Rechercher">
              <Search size={15} style={{ color: C.muted }} />
            </button>
            <NotificationBell currentUser={currentUser} questions={questions} teams={teams} labs={labs} notifications={notifications} setTab={setTab} />
            <AuthWidget currentUser={currentUser} setCurrentUser={setCurrentUser} profiles={profiles} setProfiles={setProfiles} credentials={credentials} setCredentials={setCredentials} setTab={setTab} />
            <div className="hidden sm:flex items-center gap-2.5 pr-2.5" style={{ borderRight: `1px solid ${C.line}` }}>
              <OnlineIndicator />
            </div>
            <LangSwitcher lang={lang || "fr"} onChoose={chooseLang} />
          </div>
        </div>
        <nav className="md:hidden flex items-center gap-1 px-5 pb-2.5 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className="px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                style={{ color: active ? "#fff" : C.muted, background: active ? C.primary : C.panel, border: `1px solid ${active ? C.primary : C.line}`, fontFamily: BODY_FONT }}>{(I18N[lang || "fr"].tabs[t.key]) || t.label}</button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-2 text-sm" style={{ color: C.muted, fontFamily: BODY_FONT }}>
            <RefreshCw size={14} className="animate-spin" /> chargement...
          </div>
        ) : (
          <>
            {tab === "accueil" && (
              <div className="space-y-10">
                {/* Ticker live — donne le pouls de la communauté en un coup d'œil */}
                <div className="overflow-hidden rounded-lg" style={{ border: `1px solid ${C.line}`, background: C.panel }}>
                  <div className="flex items-center">
                    <div className="flex items-center gap-1.5 px-3 py-2 shrink-0" style={{ background: `${C.alert}14`, borderRight: `1px solid ${C.line}` }}>
                      <Radio size={12} style={{ color: C.alert }} />
                      <span className="text-xs font-bold tracking-wide" style={{ color: C.alert, fontFamily: MONO_FONT }}>{L("live2")}</span>
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex gowl-ticker-track" style={{ width: "max-content" }}>
                        {[...tickerItems, ...tickerItems].map((t, i) => (
                          <span key={i} className="flex items-center gap-2 px-4 py-2 text-xs shrink-0" style={{ color: C.text, fontFamily: BODY_FONT }}>
                            <Zap size={11} style={{ color: C.gold }} /> {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hero */}
                <div className="relative overflow-hidden rounded-2xl px-1 py-2" style={{ isolation: "isolate" }}>
                  <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ width: 420, height: 420, top: -160, left: -120, background: `radial-gradient(circle, ${C.primary}30, transparent 70%)`, filter: "blur(10px)", animation: "gowl-blob-drift 14s ease-in-out infinite", zIndex: -1 }} />
                  <div aria-hidden className="absolute rounded-full pointer-events-none" style={{ width: 340, height: 340, top: -80, right: -100, background: `radial-gradient(circle, ${C.gold}22, transparent 70%)`, filter: "blur(10px)", animation: "gowl-blob-drift 18s ease-in-out infinite reverse", zIndex: -1 }} />

                  <div className="max-w-2xl mx-auto text-center py-8 gowl-fade-up">
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                      <LivePulseBadge count={liveCount} />
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ border: `1px solid ${C.line}`, color: C.muted, fontFamily: MONO_FONT }}>
                        <Gauge size={12} style={{ color: C.ok }} /> {L("watching")}
                      </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>
                      {L("heroTitle1")}<span style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{L("heroTitle2")}</span>
                    </h1>
                    <p className="text-base leading-relaxed mb-6" style={{ color: C.muted }}>
                      {L("heroSub")}
                    </p>
                    <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
                      <MemberAvatarStack profiles={profiles} />
                      <span className="text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>
                        {profiles.length > 0 ? <><b style={{ color: C.text }}>{profiles.length}</b> {L("membersJoined")}</> : L("joinFirst")} · {L("peerHelp")}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      <PrimaryButton onClick={() => setTab("forum")} style={{ boxShadow: `0 0 0 0 ${C.primary}55` }}><span className="gowl-cta-glow rounded-md inline-flex items-center gap-2"><Zap size={14} /> {L("ctaAsk")}</span></PrimaryButton>
                      <GhostButton onClick={() => setTab("salons")}><Hash size={13} /> {L("ctaHub")}</GhostButton>
                    </div>
                  </div>
                </div>

                <DataScanScene onClick={() => setTab("salons")} label={L("scanLabel")} />
              </div>
            )}
            {tab === "actus" && <NewsTab news={news} setNews={setNews} isAdmin={isAdmin} profiles={profiles} notifications={notifications} setNotifications={setNotifications} full />}
            {tab === "forum" && <ForumTab pseudo={pseudo} questions={questions} setQuestions={setQuestions} isAdmin={isAdmin} lang={lang || "fr"} currentUser={currentUser} />}
            {tab === "salons" && <RoomsTab pseudo={pseudo} messages={messages} setMessages={setMessages} isAdmin={isAdmin} lang={lang || "fr"} profiles={profiles} currentUser={currentUser} />}
            {tab === "equipes" && <TeamsTab pseudo={pseudo} teams={teams} setTeams={setTeams} announcements={teamAnnouncements} setAnnouncements={setTeamAnnouncements} isAdmin={isAdmin} lang={lang || "fr"} currentUser={currentUser} />}
            {tab === "labs" && <LabsTab pseudo={pseudo} labs={labs} setLabs={setLabs} labMessages={labMessages} setLabMessages={setLabMessages} isAdmin={isAdmin} lang={lang || "fr"} currentUser={currentUser} />}
            {tab === "classement" && <LeaderboardTab questions={questions} trophies={trophies} labs={labs} teams={teams} profiles={profiles} currentUser={currentUser} />}
            {tab === "trophies" && <TrophyTab pseudo={pseudo} trophies={trophies} setTrophies={setTrophies} isAdmin={isAdmin} currentUser={currentUser} />}
            {tab === "writeups" && <WriteupsTab pseudo={pseudo} writeups={writeups} setWriteups={setWriteups} isAdmin={isAdmin} currentUser={currentUser} />}
            {tab === "evenements" && <EventsTab pseudo={pseudo} events={events} setEvents={setEvents} isAdmin={isAdmin} currentUser={currentUser} />}
            {tab === "parcours" && <LearningPathsTab currentUser={currentUser} setTab={setTab} />}
            {tab === "boutique" && <ShopTab />}
            {tab === "assistant" && <AIAssistantTab pseudo={pseudo} />}
            {tab === "support" && <SupportTab pseudo={pseudo} currentUser={currentUser} tickets={tickets} setTickets={setTickets} supportThreads={supportThreads} setSupportThreads={setSupportThreads} />}
            {tab === "profil" && <ProtectedTab><ProfileTab currentUser={user} setCurrentUser={setUser} profiles={profiles} setProfiles={setProfiles} questions={questions} trophies={trophies} labs={labs} teams={teams} messages={messages} setTab={setTab} /> </ProtectedTab>}
            {tab === "admin" && (user?.role === "admin" ? <AdminTab isAdmin={isAdmin} setIsAdmin={setIsAdmin} questions={questions} setQuestions={setQuestions} messages={messages} setMessages={setMessages} trophies={trophies} setTrophies={setTrophies} events={events} setEvents={setEvents} profiles={profiles} teams={teams} setTeams={setTeams} teamAnnouncements={teamAnnouncements} setTeamAnnouncements={setTeamAnnouncements} orders={orders} setOrders={setOrders} labs={labs} setLabs={setLabs} labMessages={labMessages} setLabMessages={setLabMessages} tickets={tickets} setTickets={setTickets} supportThreads={supportThreads} setSupportThreads={setSupportThreads} /> : <div style={{ padding: "40px", textAlign: "center", color: "#fff" }}><h2>Accès refusé</h2><p>Vous devez être administrateur pour accéder à cette page.</p></div>)}
          </>
        )}
      </main>

      {tab === "accueil" && (
        <footer className="max-w-7xl mx-auto px-5 lg:px-8 py-8 mt-10" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="rounded-2xl border p-5" style={{ background: `linear-gradient(135deg, ${C.panel} 0%, ${C.panel2} 100%)`, borderColor: C.line }}>
            <div className="grid gap-5 md:grid-cols-[1.3fr_0.8fr_0.8fr]">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <OwlLogo size={16} />
                  <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: C.text, fontFamily: MONO_FONT }}>GowlSec</p>
                </div>
                <p className="text-sm leading-6" style={{ color: C.muted, fontFamily: BODY_FONT }}>{L("footer")}</p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] mb-3" style={{ color: C.muted, fontFamily: MONO_FONT }}>Explorer</p>
                <div className="flex flex-col items-start gap-2">
                  {[
                    { label: "Actualités", tab: "actus" },
                    { label: "Questions", tab: "forum" },
                    { label: "Hub", tab: "salons" },
                    { label: "Labs", tab: "labs" },
                    { label: "Support", tab: "support" },
                  ].map((item) => (
                    <button key={item.label} type="button" onClick={() => setTab(item.tab)} className="text-sm transition hover:opacity-80" style={{ color: C.text, fontFamily: MONO_FONT }}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] mb-3" style={{ color: C.muted, fontFamily: MONO_FONT }}>Infos</p>
                <div className="flex flex-col items-start gap-2 text-sm" style={{ color: C.muted, fontFamily: MONO_FONT }}>
                  <span>Conditions d’utilisation</span>
                  <span>Mentions légales</span>
                  <span>Politique de confidentialité</span>
                  <a href="mailto:V2V13@proton.me" className="transition hover:opacity-80" style={{ color: C.text }}>
                    V2V13@proton.me
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   Mascotte corbeau — "fouille" la base de données (visuel central accueil)
--------------------------------------------------------------------- */
function CrowSearchMascot() {
  return (
    <div className="gowl-mascot-wrap relative">
      <div aria-hidden className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${C.ok}33, transparent 70%)`, filter: "blur(6px)", transform: "scale(1.6)" }} />
      <svg width="88" height="88" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative" overflow="visible">
        <path className="gowl-wing gowl-wing-left" d="M27 48 C10 40 -2 44 2 57 C6 68 18 68 28 60 Z" fill={C.ok} opacity="0.9" />
        <path className="gowl-wing gowl-wing-right" d="M73 48 C90 40 102 44 98 57 C94 68 82 68 72 60 Z" fill={C.ok} opacity="0.9" />
        <path d="M50 18 C44 6 34 4 26 9 C36 9 41 14 44 22 Z" fill={C.ok} />
        <path d="M50 18 C56 6 66 4 74 9 C64 9 59 14 56 22 Z" fill={C.ok} />
        <ellipse cx="50" cy="58" rx="30" ry="27" fill="#10151D" stroke={C.ok} strokeWidth="2.5" />
        <polygon points="50,63 43,73 57,73" fill="#FFB454" />
        <circle cx="37" cy="52" r="9" fill="#fff" />
        <circle cx="63" cy="52" r="9" fill="#fff" />
        <circle className="gowl-eye-pupil" cx="37" cy="52" r="4" fill="#0A0C10" />
        <circle className="gowl-eye-pupil" cx="63" cy="52" r="4" fill="#0A0C10" />
      </svg>
    </div>
  );
}

function DataScanScene({ onClick, label = "corbeau en fouille dans la base de données" }) {
  const COLS = 16, ROWS = 6;
  const cells = useMemo(() => Array.from({ length: COLS * ROWS }).map(() => {
    const show = Math.random() < 0.48;
    if (!show) return null;
    return { val: Math.random() < 0.5 ? "0" : "1", op: (0.15 + Math.random() * 0.35).toFixed(2), delay: (Math.random() * 4).toFixed(2) };
  }), []);

  return (
    <button onClick={onClick} className="relative w-full overflow-hidden rounded-xl text-left" style={{ height: 300, background: C.panel, border: `1px solid ${C.line}` }}>
      <div className="absolute inset-0 grid p-4" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}>
        {cells.map((c, i) => (
          <span key={i} className={c ? "gowl-digit flex items-center justify-center text-xs" : ""}
            style={c ? { color: C.ok, fontFamily: MONO_FONT, "--gowl-op": c.op, "--gowl-delay": `${c.delay}s`, opacity: c.op } : {}}>
            {c ? c.val : ""}
          </span>
        ))}
      </div>
      <div className="absolute left-0 right-0 pointer-events-none" style={{ height: 2, background: `linear-gradient(90deg, transparent, ${C.ok}, transparent)`, boxShadow: `0 0 14px 2px ${C.ok}88`, animation: "gowl-scan-beam 3.4s ease-in-out infinite" }} />
      <div className="gowl-crow-fly-wrap pointer-events-none">
        <CrowSearchMascot />
      </div>
      <div className="absolute left-1/2 bottom-4 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full pointer-events-none" style={{ background: `${C.bg}CC`, border: `1px solid ${C.ok}33` }}>
        <span className="text-xs" style={{ color: C.ok, fontFamily: MONO_FONT }}>{label}</span>
        <span className="text-xs" style={{ color: C.ok, fontFamily: MONO_FONT, animation: "gowl-pulse-dot 1.1s steps(3) infinite" }}>...</span>
      </div>
    </button>
  );
}


function SectionHeader({ icon, eyebrow, title, subtitle, accent = C.primary }) {
  return (
    <div className="gowl-section-head mb-1" style={{ "--gowl-accent": accent }}>
      <span className="gowl-section-icon gowl-sweep-wrap">{icon}</span>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <span className="text-[10px] font-bold uppercase gowl-mono-tag inline-flex items-center gap-1.5" style={{ color: accent }}>
            <span className="gowl-live-dot" style={{ background: accent }} />{eyebrow}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-extrabold leading-tight gowl-glitch" data-text={title} style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{title}</h2>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: C.muted, fontFamily: BODY_FONT }}>{subtitle}</p>}
      </div>
      <span className="gowl-section-rule hidden sm:block" />
    </div>
  );
}

function NavCard({ icon, title, desc, onClick, accent = C.primary }) {
  return (
    <button onClick={onClick} className="gowl-navcard text-left p-4 rounded-lg flex items-start gap-3 w-full" style={{ background: C.panel, border: `1px solid ${C.line}` }}>
      <span className="gowl-navcard-icon mt-0.5 w-9 h-9 rounded-md flex items-center justify-center shrink-0" style={{ background: `${accent}1A`, color: accent }}>{icon}</span>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold mb-0.5" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{title}</h3>
        <p className="text-xs" style={{ color: C.muted, fontFamily: BODY_FONT }}>{desc}</p>
      </div>
    </button>
  );
}

/* ---------------------------------------------------------------------
   Scènes illustrées — habillage dynamique des écrans de création
--------------------------------------------------------------------- */
function SceneFrame({ children, accent }) {
  return (
    <div className="relative rounded-lg overflow-hidden mb-2" style={{ background: `radial-gradient(circle at 50% 20%, ${accent}22, transparent 65%)` }}>
      {children}
    </div>
  );
}

function ForumScene() {
  return (
    <SceneFrame accent={C.primary}>
      <svg viewBox="0 0 220 150" width="100%" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="34" width="132" height="90" rx="9" fill={C.panel2} stroke={C.line} strokeWidth="1.5" />
        <rect x="28" y="34" width="132" height="20" rx="9" fill={C.bg} />
        <circle cx="40" cy="44" r="3" fill={C.alert} /><circle cx="50" cy="44" r="3" fill={C.warn} /><circle cx="60" cy="44" r="3" fill={C.ok} />
        <rect x="40" y="64" width="62" height="5" rx="2.5" fill={C.primary} opacity="0.75" />
        <rect x="40" y="76" width="90" height="5" rx="2.5" fill={C.line} />
        <rect x="40" y="88" width="72" height="5" rx="2.5" fill={C.line} />
        <rect x="40" y="100" width="34" height="5" rx="2.5" fill={C.ok} className="gowl-cursor-blink" />
        <g className="gowl-scene-float">
          <circle cx="176" cy="46" r="21" fill={`${C.gold}22`} stroke={C.gold} strokeWidth="1.5" />
          <text x="176" y="54" textAnchor="middle" fontSize="22" fontWeight="800" fill={C.gold} fontFamily={DISPLAY_FONT}>?</text>
        </g>
      </svg>
    </SceneFrame>
  );
}

function HubScene() {
  return (
    <SceneFrame accent={C.ok}>
      <svg viewBox="0 0 220 150" width="100%" height="130" xmlns="http://www.w3.org/2000/svg">
        <g className="gowl-scene-float">
          <rect x="26" y="46" width="76" height="42" rx="11" fill={C.panel2} stroke={C.primary} strokeWidth="1.5" />
          <path d="M42 88 L42 99 L56 88 Z" fill={C.panel2} stroke={C.primary} strokeWidth="1.5" />
          <rect x="40" y="59" width="42" height="5" rx="2.5" fill={C.primary} opacity="0.75" />
          <rect x="40" y="70" width="28" height="5" rx="2.5" fill={C.line} />
        </g>
        <g className="gowl-scene-float" style={{ animationDelay: "0.45s" }}>
          <rect x="116" y="24" width="76" height="42" rx="11" fill={C.panel2} stroke={C.ok} strokeWidth="1.5" />
          <path d="M160 66 L160 77 L146 66 Z" fill={C.panel2} stroke={C.ok} strokeWidth="1.5" />
          <rect x="128" y="37" width="48" height="5" rx="2.5" fill={C.ok} opacity="0.75" />
          <rect x="128" y="48" width="30" height="5" rx="2.5" fill={C.line} />
        </g>
        <circle cx="150" cy="112" r="4" fill={C.gold} className="gowl-cursor-blink" />
        <circle cx="168" cy="120" r="3" fill={C.warn} />
      </svg>
    </SceneFrame>
  );
}

function TeamScene() {
  const crew = [{ x: 68, c: C.primary }, { x: 110, c: C.gold }, { x: 152, c: C.alert }];
  return (
    <SceneFrame accent={C.warn}>
      <svg viewBox="0 0 220 150" width="100%" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="56" width="34" height="72" rx="4" fill={C.panel2} stroke={C.line} strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x="22" y={64 + i * 16} width="22" height="8" rx="2" fill={i % 2 === 0 ? C.ok : C.line} opacity={i % 2 === 0 ? 0.85 : 0.5} />)}
        <rect x="170" y="56" width="34" height="72" rx="4" fill={C.panel2} stroke={C.line} strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x="176" y={64 + i * 16} width="22" height="8" rx="2" fill={i % 2 === 1 ? C.primary : C.line} opacity={i % 2 === 1 ? 0.85 : 0.5} />)}
        <path d={`M${crew[0].x} 78 L${crew[1].x} 68 L${crew[2].x} 78`} fill="none" stroke={C.line} strokeWidth="1.5" strokeDasharray="3 3" />
        {crew.map((h, i) => (
          <g key={i} className="gowl-scene-float" style={{ animationDelay: `${i * 0.3}s` }}>
            <path d={`M${h.x - 17} 132 Q${h.x - 17} 96 ${h.x} 93 Q${h.x + 17} 96 ${h.x + 17} 132 Z`} fill={C.bg} stroke={h.c} strokeWidth="1.5" />
            <circle cx={h.x} cy="87" r="13" fill={C.bg} stroke={h.c} strokeWidth="1.5" />
            <rect x={h.x - 6} y="82" width="12" height="6" rx="3" fill={h.c} opacity="0.85" />
          </g>
        ))}
      </svg>
    </SceneFrame>
  );
}

function LabScene() {
  return (
    <SceneFrame accent={C.alert}>
      <svg viewBox="0 0 220 150" width="100%" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect x="63" y="38" width="94" height="98" rx="7" fill={C.panel2} stroke={C.line} strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="73" y={48 + i * 19} width="74" height="13" rx="2.5" fill={C.bg} stroke={C.line} />
            <circle cx="82" cy={54.5 + i * 19} r="2.2" fill={i % 2 === 0 ? C.ok : C.warn} />
          </g>
        ))}
        <g className="gowl-shield-glow">
          <path d="M110 12 L140 23 V50 C140 72 127 87 110 94 C93 87 80 72 80 50 V23 Z" fill={C.bg} stroke={C.alert} strokeWidth="2.5" />
          <path d="M96 51 L106 61 L125 39" fill="none" stroke={C.alert} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </SceneFrame>
  );
}

function TrophyScene() {
  return (
    <SceneFrame accent={C.gold}>
      <svg viewBox="0 0 220 150" width="100%" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect x="54" y="28" width="112" height="92" rx="12" fill={C.panel2} stroke={C.line} strokeWidth="1.5" />
        <path d="M88 40h44c8 0 15 6 15 14v12c0 8-7 14-15 14h-8v10l-10-6-10 6v-10h-8c-8 0-15-6-15-14V54c0-8 7-14 15-14Z" fill={C.bg} stroke={C.gold} strokeWidth="2" />
        <circle cx="110" cy="64" r="16" fill={`${C.gold}22`} stroke={C.gold} strokeWidth="2.5" />
        <path d="M102 64l6 6 10-12" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="84" y="98" width="52" height="8" rx="4" fill={C.primary} opacity="0.8" />
        <rect x="94" y="110" width="32" height="5" rx="2.5" fill={C.line} />
      </svg>
    </SceneFrame>
  );
}

function CreationHero({ scene, eyebrow, title, subtitle, accent, onClose, children }) {
  return (
    <Panel className="overflow-hidden mb-4 relative rounded-2xl" style={{ border: `1px solid ${accent}35`, boxShadow: `0 10px 28px -18px ${accent}AA` }}>
      {onClose && (
        <button onClick={onClose} className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: `${C.bg}AA`, color: C.muted, border: `1px solid ${C.line}` }}>
          <X size={14} />
        </button>
      )}
      <div className="grid md:grid-cols-[0.78fr_1.02fr]">
        <div className="relative flex flex-col justify-center px-4 py-4 md:px-5 md:py-5 md:border-r" style={{ background: `linear-gradient(165deg, ${accent}14, transparent 75%)`, borderBottom: `1px solid ${C.line}` }}>
          {scene}
          <span className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: accent, fontFamily: MONO_FONT }}>{eyebrow}</span>
          <h3 className="text-base font-bold mb-1 leading-tight" style={{ color: C.text, fontFamily: DISPLAY_FONT }}>{title}</h3>
          <p className="text-[11px] leading-relaxed" style={{ color: C.muted, fontFamily: BODY_FONT }}>{subtitle}</p>
        </div>
        <div className="p-4 md:p-5">{children}</div>
      </div>
    </Panel>
  );
}

function ModalOverlay({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center p-3 pt-5 sm:p-4 sm:pt-7" style={{ background: "rgba(5,6,10,0.72)", isolation: "isolate" }} onClick={onClose}>
      <div className="relative z-[1] w-full max-w-2xl max-h-[88vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}