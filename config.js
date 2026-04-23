'use strict';

// ╔══════════════════════════════════════════════════════════════════════╗
// ║                   🌸 KANZANBOT v2 — CONFIG 🌸                       ║
// ╚══════════════════════════════════════════════════════════════════════╝

module.exports = {

  // ── PROPIETARIOS ─────────────────────────────────────────────────────
  // Número SIN +, SIN espacios. México: '521234567890'
  rowner : ['51958959882'],    // Propietario real (máximos permisos)
  owner  : ['51958959882'],    // Co-owners
  mods   : [],                  // Moderadores

  // ── INFORMACIÓN DEL BOT ───────────────────────────────────────────────
  botName    : 'SiriusBot 🌸',
  botVersion : '0.0.1',
  botDesc    : 'Bot de WhatsApp inspirado en los cerezos japoneses de Japón',
  botEmoji   : '🌸',
  footer     : '🌸 SiriusBot v0.0.1',

  // ── PREFIJOS (multi-prefijo) ──────────────────────────────────────────
  // Array de prefijos soportados. Ej: ['!', '.', '/']
  prefix        : ['!', '.', '#'],
  // Si es true, el bot responderá comandos sin ningún prefijo
  allowNoPrefix : false,

  // ── BASE DE DATOS ─────────────────────────────────────────────────────
  // Deja mongoUri vacío ('') para usar el JSON local (database.json)
  // Para MongoDB Atlas pon: 'mongodb+srv://user:pass@cluster.mongodb.net/kanzanbot'
  // Servicio gratuito: https://www.mongodb.com/cloud/atlas/register
  mongoUri : '',
  dbPath   : './database.json',

  // ── RESTRICT ──────────────────────────────────────────────────────────
  // Si true, los comandos marcados como "restrict" estarán bloqueados
  // hasta que el rowner los desbloquee con !restrict off
  restrictMode : true,

  // ── IDIOMA POR DEFECTO ────────────────────────────────────────────────
  defaultLang  : 'es',
  autoTranslate: false,

  // ── CONEXIÓN ─────────────────────────────────────────────────────────
  sessionPath    : './session',
  autoReconnect  : true,
  reconnectDelay : 3000,
  readMessages   : true,
  readStatus     : false,

  // ── SISTEMA DE SUB-BOTS ───────────────────────────────────────────────
  subbotDir  : './subbots',
  maxSubbots : 3,          // Máximo de sub-bots por usuario normal

  // ── MENÚ ─────────────────────────────────────────────────────────────
  // Imagen del menú (en src/). Si no existe, el menú se envía solo como texto.
  menuBanner : './src/menu.jpg',

};
