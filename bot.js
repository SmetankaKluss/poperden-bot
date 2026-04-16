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

// Кулдауны против дублей
const lastSent = { join: 0, leave: 0, online: 0 };
const COOLDOWN = 3000;

// Грустные сообщения при заходе в войс
const sadMessages = [
  'Он пришёл... куда-нибудь прятаться.',
  'Наши молитвы были услышаны... но не в хорошем смысле.',
  'Кто-то выключите микрофон...',
  'Он здесь. Спасайте себя кто может.',
  'Боже, опять он...',
  'Сервер замер в ужасе.',
  'Страж вернулся на пост. Жалко всех нас.',
  'Эхо его голоса уже звучит в наших кошмарах...'
];

// Радостные сообщения при выходе из войса
const happyMessages = [
  'Оно ушло! Свобода!',
  'Тишина... какая прекрасная тишина.',
  'Ура! Можно дышать!',
  'Он ушёл! Празднуем!',
  'Наконец-то мир и покой!',
  'Войс свободен! Хвала богам!',
  'Тишиана наступила. Радуемся.'
];

// Сообщения при заходе в сеть
const onlineMessages = [
  'Он появился в сети... берегитесь.',
  'booopaaa теперь онлайн. Прячьтесь.',
  'Он нагрянул без предупреждения!',
  'Новая жертва подключилась к серверу.',
  'Он в сети. Все к бою!',
  'Система обнаружила присутствие booopaaa. Эвакуация!'
];

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// === Голосовые каналы ===
client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.member.id !== TARGET_USER_ID) return;

  // Заход в войс (не было в канале → появился)
  if (!oldState.channel && newState.channel) {
    if (Date.now() - lastSent.join < COOLDOWN) return;
    lastSent.join = Date.now();
    const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
    if (channel) channel.send(getRandom(sadMessages));
  }

  // Выход из войса (был в канале → вышел)
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

  // Проверяем: был не в сети → стал в сети
  const wasOffline = oldPresence.status === 'offline';
  const nowOnline = newPresence.status === 'online';

  if (wasOffline && nowOnline) {
    if (Date.now() - lastSent.online < COOLDOWN) return;
    lastSent.online = Date.now();
    const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
    if (channel) channel.send(getRandom(onlineMessages));
  }
});

client.on('ready', () => {
  console.log(`Бот ${client.user.tag} запущен!`);
});

client.login(process.env.TOKEN);
