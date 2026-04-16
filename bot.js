const Discord = require('discord.js');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildPresences
  ],
  presence: {
    status: 'online',
    activities: [{ name: 'за booopaaa', type: Discord.ActivityType.Watching }]
  }
});

const TARGET_USER_ID = '1052622600259502132';
const ALERT_CHANNEL_ID = '1494408748645748897';
const NEWS_CHANNEL_ID = '1466527104135856249';
const HELRAY_ID = '<@815218915982311424>';

const lastSent = { join: 0, leave: 0, online: 0 };
const COOLDOWN = 3000;
const lastSentGame = {};
const GAME_COOLDOWN = 60000;

const sadMessages = [
  'Он пришёл... куда-нибудь прятаться.',
  'Наши молитвы были услышаны... но не в хорошем смысле.',
  'Кто-нибудь выключите микрофон...',
  'Он здесь. Спасайте себя кто может.',
  'Боже, опять он...',
  'Сервер замер в ужасе.',
  'Страж вернулся на пост. Жалко всех нас.',
  'Эхо его голоса уже звучит в наших кошмарах...'
];

const happyMessages = [
  'Оно ушло! Свобода!',
  'Тишина... какая прекрасная тишина.',
  'Ура! Можно дышать!',
  'Он ушёл! Празднуем!',
  'Наконец-то мир и покой!',
  'Войс свободен! Хвала богам!',
  'Тишиана наступила. Радуемся.'
];

const onlineMessages = [
  `${HELRAY_ID} Он появился в сети... берегитесь.`,
  `${HELRAY_ID} booopaaa теперь онлайн. Прячьтесь.`,
  `${HELRAY_ID} Он нагрянул без предупреждения!`,
  `${HELRAY_ID} bopa в сети, готовься!`,
  `${HELRAY_ID} Он в сети. Все к бою!`,
  `${HELRAY_ID} Система обнаружила присутствие booopaaa. Эвакуация!`
];

const gameMessages = {
  valorant: [
    `${HELRAY_ID} bopa зашёл в Valorant. Удачи не умереть...`,
    `${HELRAY_ID} booopaaa играет в Valorant! Рандомам сочувствую.`,
    `${HELRAY_ID} Он запустил Валорант. Молитва за его тиммейтов.`
  ],
  genshin: [
    `${HELRAY_ID} bopa зашёл в Genshin Impact. Пора холить waifu.`,
    `${HELRAY_ID} booopaaa в Genshin! Надеюсь он не пробахал гачу.`,
    `${HELRAY_ID} Он запустил Генсин. Ждём арты с новых персонажей.`
  ]
};

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// === Голосовые каналы ===
client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.member.id !== TARGET_USER_ID) return;
  if (!oldState.channel && newState.channel) {
    if (Date.now() - lastSent.join < COOLDOWN) return;
    lastSent.join = Date.now();
    const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
    if (channel) channel.send(getRandom(sadMessages));
  }
  if (oldState.channel && !newState.channel) {
    if (Date.now() - lastSent.leave < COOLDOWN) return;
    lastSent.leave = Date.now();
    const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
    if (channel) channel.send(getRandom(happyMessages));
  }
});

// === Статус онлайн ===
client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (!oldPresence || !newPresence) return;
  if (newPresence.userId !== TARGET_USER_ID) return;
  if (oldPresence.status === 'offline' && newPresence.status === 'online') {
    if (Date.now() - lastSent.online < COOLDOWN) return;
    lastSent.online = Date.now();
    const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
    if (channel) channel.send(getRandom(onlineMessages));
  }
});

// === Заход в игру ===
client.on('presenceUpdate', (oldPresence, newPresence) => {
  if (!oldPresence || !newPresence) return;
  if (newPresence.userId !== TARGET_USER_ID) return;
  const activities = newPresence.activities;
  if (!activities || activities.length === 0) return;
  const game = activities.find(a => a.type === Discord.ActivityType.Playing);
  if (!game) return;
  const name = game.name.toLowerCase();
  if (name.includes('valorant')) {
    if (Date.now() - (lastSentGame.valorant || 0) < GAME_COOLDOWN) return;
    lastSentGame.valorant = Date.now();
    const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
    if (channel) channel.send(getRandom(gameMessages.valorant));
  }
  if (name.includes('genshin')) {
    if (Date.now() - (lastSentGame.genshin || 0) < GAME_COOLDOWN) return;
    lastSentGame.genshin = Date.now();
    const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
    if (channel) channel.send(getRandom(gameMessages.genshin));
  }
});

// === Telegram → Discord (парсинг веб-версии) ===
let lastPostId = null;
const TG_CHANNEL = 'r34_channel';
const CHECK_INTERVAL = 30000; // проверять каждые 30 сек

async function checkTelegramPosts() {
  try {
    const res = await fetch(`https://t.me/s/${TG_CHANNEL}`);
    if (!res.ok) return;

    const html = await res.text();
    const $ = cheerio.load(html);
    const posts = [];

    $('.tgme_widget_message').each((i, el) => {
      const $el = $(el);
      const id = $el.attr('data-post');
      const $text = $el.find('.tgme_widget_message_text');
      const text = $text.text().trim();
      const $img = $el.find('.tgme_widget_message_photo_wrap img');
      const imgUrl = $img.attr('src');

      if (id) {
        posts.push({ id, text, imgUrl });
      }
    });

    if (posts.length === 0) return;

    // Сортируем от старых к новым
    posts.reverse();

    const channel = client.channels.cache.get(NEWS_CHANNEL_ID);
    if (!channel || !client.readyAt) return;

    for (const post of posts) {
      if (lastPostId && post.id <= lastPostId) continue;

      try {
        if (post.imgUrl && post.text) {
          await channel.send({ content: `**[TG]** ${post.text}`, files: [post.imgUrl] });
        } else if (post.imgUrl) {
          await channel.send({ content: `**[TG]**`, files: [post.imgUrl] });
        } else if (post.text) {
          await channel.send(`**[TG]** ${post.text}`);
        }
      } catch (e) {
        // Если картинка не загрузилась, шлём текст с ссылкой
        const link = `https://t.me/${TG_CHANNEL}/${post.id.split('/')[1]}`;
        if (post.text) {
          await channel.send(`**[TG]** ${post.text}\n${link}`);
        }
      }

      lastPostId = post.id;
    }
  } catch (e) {
    console.error('Ошибка TG парсинга:', e.message);
  }
}

client.on('ready', () => {
  console.log(`Бот ${client.user.tag} запущен!`);
  // Первая проверка сразу
  checkTelegramPosts();
  // Потом каждые 30 секунд
  setInterval(checkTelegramPosts, CHECK_INTERVAL);
});

client.login(process.env.TOKEN);
