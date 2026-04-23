'use strict';

// ╔══════════════════════════════════════════════════════════════════════╗
// ║     🌸 KANZANBOT v2 — PERFIL + PIROPOS 🌸                          ║
// ╚══════════════════════════════════════════════════════════════════════╝

const moment = require('moment');
const { SUPPORTED } = require('../lib/i18n');

module.exports = {
  commands: [
    'perfil', 'profile',
    'registro', 'register', 'setnombre', 'setname',
    'setlang', 'idioma',
    'piropo' // 👈 añadido
  ],

  description: 'Perfil de usuario + piropos aleatorios',
  category: 'general',

  async execute(ctx) {
    const { command, args, sender, pushName, db, reply, tr, lang, react } = ctx;

    // ── 🌹 LISTA DE PIROPOS ───────────────────────────────────────
    const piropos = [
      'Me gustaría ser papel para poder envolver ese bombón.',
      'Eres como wifi sin contraseña, todo el mundo te busca.',
      'Quién fuera bus para andar por las curvas de tu corazón.',
      'Quiero volar sin alas y entrar en tu universo y amarte en silencio.',
      'Quisiera ser mantequilla para derretirme en tu arepa.',
      'Si la belleza fuera pecado ya estarías en el infierno.',
      'Me gustaría ser un gato para pasar 7 vidas a tu lado.',
      'Robar está mal pero un beso tuyo sí me lo robaría.',
      'Bonita, camina por la sombra, el sol derrite los chocolates.',
      'Pareces Google porque tienes todo lo que busco.',
      'Mi café favorito es el de tus ojos.',
      'Quisiera que fueras cereal para cucharearte en las mañanas.'
    ];

    const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

    // ── 💘 !piropo ───────────────────────────────────────────────
    if (command === 'piropo') {
      if (!piropos.length) return reply('*[❌] No hay piropos disponibles*');

      const texto = pickRandom(piropos);
      await react('💘');

      return reply(
        `*╔═══════════════════════════*\n` +
        `➢ *"${texto}"*\n` +
        `*╚═══════════════════════════*`
      );
    }

    // ── 👤 !perfil ───────────────────────────────────────────────
    if (['perfil', 'profile'].includes(command)) {
      const user = await db.getUser(sender);
      const since = user.createdAt
        ? moment(user.createdAt).locale('es').fromNow()
        : 'desconocido';
      const premium = await db.isPremium(sender);

      return reply(tr('profile_show', {
        name   : user.name || pushName || 'Sin nombre',
        lang   : SUPPORTED[user.lang || lang] || user.lang || lang,
        premium: premium ? '✅ Sí' : '❌ No',
        since,
      }));
    }

    // ── 📝 !registro ─────────────────────────────────────────────
    if (['registro', 'register', 'setnombre', 'setname'].includes(command)) {
      const name = args.join(' ').trim();

      if (!name) {
        return reply(
          `*[❗] Indica tu nombre.*\n\n` +
          `Ejemplo: \`!registro Juan Pérez\``
        );
      }

      if (name.length > 50) {
        return reply('*[❌] El nombre no puede tener más de 50 caracteres.*');
      }

      await db.setUser(sender, { name });
      return reply(tr('profile_saved', { name }));
    }

    // ── 🌐 !setlang ──────────────────────────────────────────────
    if (['setlang', 'idioma'].includes(command)) {
      const code = args[0]?.toLowerCase();

      if (!code) {
        const langList = Object.entries(SUPPORTED)
          .map(([k, v]) => `  \`${k}\` — ${v}`)
          .join('\n');

        const user = await db.getUser(sender);

        return reply(
          `*[🌐] Configuración de Idioma*\n\n` +
          `Tu idioma actual: *${SUPPORTED[user.lang || lang] || lang}*\n\n` +
          `*Idiomas disponibles:*\n${langList}\n\n` +
          `Uso: \`!setlang en\``
        );
      }

      if (!SUPPORTED[code]) {
        return reply(
          `*[❌] Idioma no soportado:* \`${code}\`\n` +
          `Usa \`!setlang\` para ver la lista.`
        );
      }

      await db.setUser(sender, { lang: code });
      return reply(tr('lang_set', { lang: SUPPORTED[code] }));
    }
  },
};
