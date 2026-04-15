const { Habit, User } = require('../models');

exports.getChatResponse = async (req, res) => {
  try {
    const { message, language } = req.body; // Теперь мы получаем язык от фронтенда!
    const msg = message ? message.toLowerCase() : '';
    const lang = language || 'ru'; // По умолчанию русский
    
    const userId = req.user?.id || req.user || req.userId;
    let user = userId ? await User.findByPk(userId.id || userId) : null;
    if (!user) user = { username: 'Гость', level: 1, xp: 0 };
    
    let habitCount = 0;
    if (user.id) habitCount = await Habit.count({ where: { userId: user.id } });
    
    // === СЛОВАРИ ОТВЕТОВ (RU, KK, EN) ===
    const replies = {
      ru: {
        shop: `${user.username}, магазин — это вкладка "Shop" 🛍️. Потрать свои ${user.xp} XP на крутые плюшки!`,
        leaderboard: `Раздел "Leaderboard" 🏆 слева. Зайди и посмотри, кто разрывает SDU!`,
        stats: `Твоя сводка: Уровень ${user.level}, Опыт: ${user.xp} XP, Привычек: ${habitCount}.`,
        lazy: habitCount > 0 ? `Хватит ныть! У тебя ${habitCount} задач. Иди закрой стрик!` : `У тебя 0 привычек. Добавь новую в Dashboard!`,
        creators: `Создатели этого шедевра — легенды SDU: Arsen, Danat и Akarys.`,
        greeting: `Салам, ${user.username}! Твой ${user.level} уровень сам себя не прокачает. Что делаем?`,
        fallback: `Сложный вопрос. Но я точно знаю, что тебе пора во вкладку "Habits" 😉`
      },
      kk: {
        shop: `${user.username}, дүкен "Shop" 🛍️ бөлімінде. Жиналған ${user.xp} XP-ді сол жерде жұмса!`,
        leaderboard: `"Leaderboard" 🏆 сол жақ мәзірде. SDU-да кім мықты екенін көрейік!`,
        stats: `Сенің статистикаң: Деңгей ${user.level}, Тәжірибе: ${user.xp} XP, Әдеттер: ${habitCount}.`,
        lazy: habitCount > 0 ? `Жалқауланба! Сенде ${habitCount} тапсырма бар. Бар да орында!` : `Сенде әлі әдет жоқ. Dashboard-та жаңасын қос!`,
        creators: `Бұл жобаны жасаған SDU аңыздары: Arsen, Danat және Akarys.`,
        greeting: `Сәлем, ${user.username}! ${user.level}-ші деңгейді көтеретін кез келді. Бастаймыз ба?`,
        fallback: `Қызық сұрақ... Бірақ қазір бастысы — сенің әдеттерің! 😉`
      },
      en: {
        shop: `${user.username}, the shop is in the "Shop" tab 🛍️. Spend your ${user.xp} XP there!`,
        leaderboard: `Check the "Leaderboard" 🏆 to see who's dominating SDU right now!`,
        stats: `Your stats: Level ${user.level}, Experience: ${user.xp} XP, Habits: ${habitCount}.`,
        lazy: habitCount > 0 ? `Stop being lazy! You have ${habitCount} tasks. Go keep your streak alive!` : `You have 0 habits. Create one in the Dashboard!`,
        creators: `Created by the SDU legends: Arsen, Danat, and Akarys.`,
        greeting: `Hello, ${user.username}! Ready to level up from level ${user.level}? Let's go!`,
        fallback: `Tough question! But I do know you should check your "Habits" tab 😉`
      }
    };

    let response = "";

    // === ЛОГИКА РАСПОЗНАВАНИЯ (Ищет слова на всех 3 языках) ===
    if (msg.includes("магазин") || msg.includes("купить") || msg.includes("дүкен") || msg.includes("сатып") || msg.includes("shop") || msg.includes("buy")) {
      response = replies[lang].shop;
    } 
    else if (msg.includes("лидер") || msg.includes("топ") || msg.includes("рейтинг") || msg.includes("көшбасшы")) {
      response = replies[lang].leaderboard;
    }
    else if (msg.includes("статистика") || msg.includes("уровень") || msg.includes("деңгей") || msg.includes("level") || msg.includes("стата") || msg.includes("stats")) {
      response = replies[lang].stats;
    }
    else if (msg.includes("совет") || msg.includes("помоги") || msg.includes("лень") || msg.includes("жалқау") || msg.includes("көмек") || msg.includes("lazy") || msg.includes("help")) {
      response = replies[lang].lazy;
    }
    else if (msg.includes("создал") || msg.includes("автор") || msg.includes("кім жасады") || msg.includes("creator") || msg.includes("made")) {
      response = replies[lang].creators;
    }
    else if (msg.match(/^(салам|привет|хай|сәлем|hello|hi)/)) {
      response = replies[lang].greeting;
    }
    else {
      response = replies[lang].fallback;
    }

    setTimeout(() => res.json({ response }), 600);

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ response: "Error/Қате/Ошибка 🤖" });
  }
};