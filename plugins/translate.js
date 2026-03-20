'use strict';

const { translateText, SUPPORTED_LANGS } = require('../lib/translate');

module.exports = {
  commands    : ['traducir', 'translate', 'tr'],
  description : 'Traduce texto preservando formato WhatsApp',
  category    : 'utilidades',
  usage       : '!traducir [idioma] [texto] | Responde a un mensaje con !tr en',

  async execute(ctx) {
    const { args, msg, reply } = ctx;

    if (!args.length) {
      const list = Object.entries(SUPPORTED_LANGS).map(([k,v]) => `\`${k}\` ${v}`).join('  •  ');
      return reply(
        `*[🌐] Traductor*\n\n` +
        `*Uso:*\n` +
        `▸ \`!traducir en Hola mundo\`\n` +
        `▸ Responde a un mensaje con \`!tr ja\`\n\n` +
        `*Idiomas:*\n${list}`
      );
    }

    const validLangs = Object.keys(SUPPORTED_LANGS);
    const possibleLang = args[0].toLowerCase();
    let targetLang = 'en', textToTranslate = '';

    if (validLangs.includes(possibleLang)) {
      targetLang      = possibleLang;
      textToTranslate = args.slice(1).join(' ');
    } else {
      textToTranslate = args.join(' ');
    }

    if (!textToTranslate.trim()) {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quoted) {
        textToTranslate = quoted.conversation ||
          quoted.extendedTextMessage?.text ||
          quoted.imageMessage?.caption || '';
      }
    }

    if (!textToTranslate.trim())
      return reply('*[❗]* Escribe el texto a traducir o responde a un mensaje.\nEj: `!traducir en Hola`');

    try {
      const result   = await translateText(textToTranslate, targetLang);
      const langName = SUPPORTED_LANGS[result.to]  || result.to;
      const fromName = SUPPORTED_LANGS[result.from] || result.from;
      return reply(`*[🌐] Traducción*  ${fromName} → *${langName}*\n\n${result.text}`);
    } catch (e) {
      return reply(`*[❌] Error al traducir:* ${e.message}`);
    }
  },
};
