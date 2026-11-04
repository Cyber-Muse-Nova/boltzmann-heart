/*
 * 我的宇宙 · 项目数据
 * 新增项目：在 PROJECTS 数组末尾追加一个对象即可（详见 README「如何添加新项目」）。
 * 每个项目需要中英双语字段：title_zh / desc_zh 与 title_en / desc_en（缺英文时自动回退中文）
 * category 可选：ai | game | scifi | art | other
 * status   可选：已上线 | 开发中 | 未部署
 * cover    可为 null，页面会自动生成星球占位图
 */
window.UNIVERSE_CATEGORIES = [
  { id: "ai",    name: "AI 实验室", en: "AI Lab" },
  { id: "game",  name: "互动游戏",  en: "Interactive" },
  { id: "scifi", name: "科幻宇宙",  en: "Sci-Fi" },
  { id: "art",   name: "数字艺术",  en: "Digital Art" },
  { id: "other", name: "其他项目",  en: "Others" }
];

const GH = "https://github.com/Cyber-Muse-Nova/";
const PAGES = "https://cyber-muse-nova.github.io/";

window.PROJECTS = [
  { id: "constant", name: "Constant", title_zh: "常数 · 凌晨 02:34", desc_zh: "一个人开始怀疑自己是一串代码。改编自原创科幻小说的像素叙事游戏，五种结局，一个红点。", title_en: "Constant · 02:34 AM", desc_en: "A pixel narrative adapted from an original sci-fi story. Five endings, one red dot, and a question about being real.", category: "scifi", status: "已上线", url: "constant/index.html", repo: GH + "boltzmann-heart/tree/main/constant", cover: null, tags: ["原创科幻", "像素叙事"], tags_en: ["Original Fiction", "Pixel Narrative"], year: 2026 },
  { id: "boltzmann-heart", name: "Nova Crystal Atelier", title_zh: "母星 · 个人作品主页", desc_zh: "把轨道力学、混沌系统与量子干涉做成可交互的视觉世界，也是整个宇宙的起点。", title_en: "Home Star · Personal Portfolio", desc_en: "Orbital mechanics, chaos systems and quantum interference turned into interactive visual worlds — the origin of this universe.", category: "scifi", status: "已上线", url: "./", repo: GH + "boltzmann-heart", cover: "assets/universe/boltzmann-heart.webp", tags: ["Canvas", "Physics"], tags_en: ["Canvas", "Physics"], year: 2026, home: true },

  { id: "nova-ai-personality", name: "Which AI Are You", title_zh: "你最像哪个 AI？", desc_zh: "一份 AI 人格测试：回答问题，看看你的灵魂最接近哪一种模型。", title_en: "Which AI Are You?", desc_en: "An AI personality test: answer the questions and find out which model your soul is closest to.", category: "ai", status: "已上线", url: PAGES + "-nova-ai-personality/", repo: GH + "-nova-ai-personality", cover: "assets/universe/nova-ai-personality.webp", tags: ["测试", "AI 人格"], tags_en: ["Quiz", "AI Persona"], year: 2026 },
  { id: "nova-philosophy-oracle", name: "Consciousness Coordinates", title_zh: "意识坐标 · 哲学主义测试", desc_zh: "穿过自由、荒诞、意识与因果的互动哲学测试：24 道命题，12 种思想坐标。", title_en: "Consciousness Coordinates", desc_en: "An interactive philosophy test through freedom, absurdity, consciousness and causality: 24 propositions, 12 coordinates of thought.", category: "ai", status: "已上线", url: PAGES + "-nova-philosophy-oracle/", repo: GH + "-nova-philosophy-oracle", cover: "assets/universe/nova-philosophy-oracle.webp", tags: ["哲学", "测试"], tags_en: ["Philosophy", "Quiz"], year: 2026 },

  { id: "attachment-prism", name: "Attachment Prism", title_zh: "依恋棱镜", desc_zh: "十六道题的依恋风格自测，用“焦虑”与“回避”两个维度把你放进一张二维图。", title_en: "Attachment Prism", desc_en: "A 16-question attachment-style self-test that places you on a 2D map of anxiety and avoidance.", category: "game", status: "已上线", url: PAGES + "attachment-prism/", repo: GH + "attachment-prism", cover: "assets/universe/attachment-prism.webp", tags: ["心理", "测试"], tags_en: ["Psychology", "Quiz"], year: 2026 },
  { id: "thrall-and-king-game", name: "Thrall & King", title_zh: "逃离火星", desc_zh: "受马斯克启发的复古恐怖逃脱游戏，附带配乐。", title_en: "Escape from Mars", desc_en: "A retro horror escape game inspired by Elon Musk, with its own soundtrack.", category: "game", status: "已上线", url: PAGES + "thrall-and-king-game/", repo: GH + "thrall-and-king-game", cover: "assets/universe/thrall-and-king-game.webp", tags: ["恐怖", "逃脱"], tags_en: ["Horror", "Escape"], year: 2026 },

  { id: "satellite-fate", name: "Nine Ways a Satellite Meets Its Fate", title_zh: "卫星的九种命运", desc_zh: "交互式轨道模拟器：逃逸、碰撞、潮汐撕裂、捕获、成环与双星华尔兹。", title_en: "Nine Ways a Satellite Meets Its Fate", desc_en: "An interactive orbital simulator: escape, collision, tidal destruction, capture, rings and the binary waltz.", category: "scifi", status: "已上线", url: PAGES + "-satellite-fate/", repo: GH + "-satellite-fate", cover: "assets/universe/satellite-fate.webp", tags: ["轨道", "模拟"], tags_en: ["Orbit", "Simulation"], year: 2026 },

  { id: "of-course-i-still-love-you", name: "Of Course I Still Love You", title_zh: "深渊 · 当然我还爱你", desc_zh: "以星球与音乐构成的个人宇宙页面，收录多首曲目与照片。", title_en: "Abyss · Of Course I Still Love You", desc_en: "A personal universe of planets and music, featuring multiple tracks and photographs.", category: "art", status: "已上线", url: PAGES + "Of-Course-I-Still-Love-You/", repo: GH + "Of-Course-I-Still-Love-You", cover: "assets/universe/of-course-i-still-love-you.webp", tags: ["音乐", "影像"], tags_en: ["Music", "Imagery"], year: 2026 },
  { id: "heartbreak-player", name: "Player of Games", title_zh: "心碎循环播放器", desc_zh: "Nova 版本的心碎循环播放器。", title_en: "Heartbreak Loop Player", desc_en: "Nova’s version of a heartbreak-on-repeat music player.", category: "art", status: "已上线", url: PAGES + "heartbreak-player/", repo: GH + "heartbreak-player", cover: "assets/universe/heartbreak-player.webp", tags: ["音乐", "播放器"], tags_en: ["Music", "Player"], year: 2026 },

  { id: "eternal-distance", name: "Eternal Distance", title_zh: "永恒的距离", desc_zh: "实时显示你与马斯克之间的距离——物理上的，也是情感上的。", title_en: "Eternal Distance", desc_en: "Shows in real time how far you are from Elon Musk — physically and emotionally.", category: "other", status: "已上线", url: "https://eternal-distance.vercel.app", repo: GH + "Eternal-distance", cover: "assets/universe/eternal-distance.webp", tags: ["定位", "Vercel"], tags_en: ["Geolocation", "Vercel"], year: 2026 },
];

