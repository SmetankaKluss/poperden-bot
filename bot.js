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

const joinMessages = [
  '😢 oh no... <@1052622600259502132> зашёл в **{channel}**... опять...',
  '😭 Господи, опять он... <@1052622600259502132> подключился к **{channel}**',
  '💀 <@1052622600259502132> пришёл в **{channel}**... мы обречены...',
  '🥲 Нет только не это... <@1052622600259502132> в **{channel}**...',
  '😵 <@1052622600259502132> зашёл в **{channel}**... начинается...',
  '🫠 <@1052622600259502132> подключился к **{channel}**... молюсь чтобы он быстро ушёл',
  '😖 Опять... <@1052622600259502132> в **{channel}**... чьё это было решение позвать его...',
  '😔 <@1052622600259502132> зашёл в **{channel}**... сегодняшний день испорчен',
  '🤦 <@1052622600259502132> снова в **{channel}**... когда же это закончится...',
  '😢 <@1052622600259502132> в **{channel}**... все расходимся...',
  '😢😢 <@1052622600259502132> зашёл... выживайте кто сможет...',
];

const leaveMessages = [
  '🎉 ЕСТЬ БОГ! <@1052622600259502132> покинул **{channel}**! СВОБОДА!',
  '🥳 УРАААА! <@1052622600259502132> вышел из **{channel}**! ПРАЗДНИК!',
  '🎊 <@1052622600259502132> ушёл из **{channel}**! Тишина, благословенная тишина!',
  '🥂 <@1052622600259502132> вылетел из **{channel}**! Открываем шампанское!',
  '🏆 <@1052622600259502132> покинул **{channel}**! Лучший день в моей жизни!',
  '💃 <@1052622600259502132> вышел из **{channel}**! Врубаем музыку!',
  '🙌 СЛАВА БОГАМ! <@1052622600259502132> больше не в **{channel}**!',
  '🎆 <@1052622600259502132> ушёл из **{channel}**! Мир снова прекрасен!',
  '🤩 <@1052622600259502132> вышел из **{channel}**! Наконец-то!',
  '🎉🎉🎉 <@1052622600259502132> покинул чат! Этот день стоит отметить!',
  '🎊🎊🎊 <@1052622600259502132> ушёл! Запускаем фейерверки из **{channel}**!',
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

  if (!oldState.channelId && newState.channelId) {
    const msg = pickRandom(joinMessages).replace('{channel}', newState.channel.name);
    channel.send(msg);
  }

  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    const msg = pickRandom(joinMessages).replace('{channel}', newState.channel.name);
    channel.send(msg);
  }

  if (oldState.channelId && !newState.channelId) {
    const msg = pickRandom(leaveMessages).replace('{channel}', oldState.channel.name);
    channel.send(msg);
  }
});

client.login(process.env.TOKEN);
