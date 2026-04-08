const keepAlive = require('./server');
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const TARGET_USER_ID = '1052622600259502132';
const ALERT_CHANNEL_ID = '1466542405208510525';

// Защита от двойных сообщений
const lastSent = { join: 0, leave: 0 };
const COOLDOWN = 3000; // 3 секунды

const joinMessages = [
  '😢 oh no... <@1052622600259502132> зашёл в **{channel}**... опять...',
  '😭 Господи, опять он... <@1052622600259502132> подключился к **{channel}**',
  '💀 <@1052622600259502132> пришёл в **{channel}**... мы обречены...',
  '🥲 Нет только не это... <@1052622600259502132> в **{channel}**...',
  '😵 <@1052622600259502132> зашёл в **{channel}**... начинается...',
  '🫠 <@1052622600259502132> подключился к **{channel}**... молюсь чтобы он быстро ушёл',
  '😖 Опять... <@1052622600259502132> в **{channel}**...',
  '😔 <@1052622600259502132> зашёл в **{channel}**... сегодняшний день испорчен',
  '🤦 <@1052622600259502132> снова в **{channel}**... когда же это закончится...',
  '😢 <@1052622600259502132> в **{channel}**... все расходимся...',
  '😢😢 <@1052622600259502132> зашёл... выживайте кто сможет...',
];

const leaveMessages = [
  '🎉 ЕСТЬ БОГ! <@1052622600259502132> покинул **{channel}**! СВОБОДА!',
  '🥳 УРАААА! <@1052622600259502132> вышел из **{channel}**! ПРАЗДНИК!',
  '🎊 <@1052622600259502132> ушёл из **{channel}**! Тишина!',
  '🥂 <@1052622600259502132> вылетел из **{channel}**! Шампанское!',
  '🏆 <@1052622600259502132> покинул **{channel}**! Лучший день!',
  '💃 <@1052622600259502132> вышел из **{channel}**! Врубаем музыку!',
  '🙌 СЛАВА БОГАМ! <@1052622600259502132> больше не в **{channel}**!',
  '🎆 <@1052622600259502132> ушёл из **{channel}**! Мир прекрасен!',
  '🤩 <@1052622600259502132> вышел из **{channel}**! Наконец-то!',
  '🎉🎉🎉 <@1052622600259502132> ушёл! Этот день стоит отметить!',
  '🎊🎊🎊 <@1052622600259502132> ушёл! Фейерверки!',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

client.once('ready', () => {
  console.log('🟢 Бот запущен! Следим за поперденем 👀');
  client.user.setActivity('следит за поперденем');
});

client.on('voiceStateUpdate', (oldState, newState) => {
  if (newState.member?.id !== TARGET_USER_ID) return;

  const channel = client.channels.cache.get(ALERT_CHANNEL_ID);
  if (!channel) return;

  const now = Date.now();

  // Заход в войс
  if (!oldState.channelId && newState.channelId) {
    if (now - lastSent.join < COOLDOWN) return;
    lastSent.join = now;
    const msg = pickRandom(joinMessages).replace('{channel}', newState.channel.name);
    channel.send(msg);
  }

  // Переход в другой войс
  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    if (now - lastSent.join < COOLDOWN) return;
    lastSent.join = now;
    const msg = pickRandom(joinMessages).replace('{channel}', newState.channel.name);
    channel.send(msg);
  }

  // Выход из войса
  if (oldState.channelId && !newState.channelId) {
    if (now - lastSent.leave < COOLDOWN) return;
    lastSent.leave = now;
    const msg = pickRandom(leaveMessages).replace('{channel}', oldState.channel.name);
    channel.send(msg);
  }
});

client.login(process.env.TOKEN);
