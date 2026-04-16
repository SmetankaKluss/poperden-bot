const Discord = require('discord.js');

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
const ALERT_CHANNEL_ID = '1466542405208510525';
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

  const wasOffline = oldPresence.status === 'offline';
  const nowOnline = newPresence.status === 'online';

  if (wasOffline && nowOnline) {
    if (Date.now() - lastSent.online < COOLDOWN) return;
    lastSent.online = Date.now();
    const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
    if (channel) channel.send(getRandom(onlineMessages));
  }
});

// === Заход в игру Valorant или Genshin ===
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

client.on('ready', () => {
  console.log(`Бот ${client.user.tag} запущен!`);
});

client.login(process.env.TOKEN);
