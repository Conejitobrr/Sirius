'use strict';

// ╔══════════════════════════════════════════════════════════════════════╗
// ║              🌸 KANZANBOT v2 — UTILS / UTILIDADES 🌸                ║
// ╚══════════════════════════════════════════════════════════════════════╝

const db     = require('./database');
const config = require('../config');

let _store = null;
function setStore(store) { _store = store; }
function getStore()      { return _store; }

// ══════════════════════════════════════════════════════════════════════
//   RESOLUCIÓN DE @LID
// ══════════════════════════════════════════════════════════════════════

async function resolveLid(jid, storeOverride) {
  if (!jid) return jid;
  if (!jid.endsWith('@lid')) return jid;

  const store = storeOverride || _store;

  // 1. Store en memoria de Baileys
  if (store?.contacts) {
    const contacts = Object.values(store.contacts);
    const match = contacts.find(c => c.lid === jid && c.id && !c.id.endsWith('@lid'));
    if (match) { await db.storeLid(jid, match.id); return match.id; }
  }

  // 2. Base de datos persistente
  const fromDB = await db.resolveLidFromDB(jid);
  if (fromDB !== jid) return fromDB;

  // 3. Fallback
  return jid;
}

function resolveLidSync(jid, storeOverride) {
  if (!jid || !jid.endsWith('@lid')) return jid;
  const store = storeOverride || _store;
  if (store?.contacts) {
    const contacts = Object.values(store.contacts);
    const match = contacts.find(c => c.lid === jid && c.id && !c.id.endsWith('@lid'));
    if (match) return match.id;
  }
  return jid;
}

async function learnLidsFromParticipants(participants = []) {
  for (const p of participants) {
    if (p.lid && p.id && !p.id.endsWith('@lid')) await db.storeLid(p.lid, p.id);
    if (p.id?.endsWith('@lid') && p.lid && !p.lid.endsWith('@lid')) await db.storeLid(p.id, p.lid);
  }
}

function normalizeJid(jid) {
  if (!jid) return '';
  if (jid.includes(':') && jid.endsWith('@s.whatsapp.net')) {
    return jid.split(':')[0] + '@s.whatsapp.net';
  }
  return jid;
}

function getDisplayNumber(jid) {
  if (!jid) return 'Desconocido';
  if (jid.endsWith('@s.whatsapp.net')) return jid.split('@')[0];
  if (jid.endsWith('@lid')) return 'Usuario';
  return jid.split('@')[0];
}

// ══════════════════════════════════════════════════════════════════════
//   MULTIPREFIJO
// ══════════════════════════════════════════════════════════════════════

/**
 * Detecta si el texto comienza con algún prefijo configurado.
 * Retorna { prefix, body } o null si no hay coincidencia y !allowNoPrefix
 */
function detectPrefix(text) {
  if (!text) return null;

  const prefixes = Array.isArray(config.prefix) ? config.prefix : [config.prefix];

  for (const p of prefixes) {
    if (text.startsWith(p)) {
      return { prefix: p, body: text.slice(p.length).trim() };
    }
  }

  // Sin prefijo
  if (config.allowNoPrefix) {
    return { prefix: '', body: text.trim() };
  }

  return null;
}

// ══════════════════════════════════════════════════════════════════════
//   EXTRACCIÓN DE MENSAJES
// ══════════════════════════════════════════════════════════════════════

function getBody(msg) {
  const m = msg.message;
  if (!m) return '';
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    m.documentMessage?.caption ||
    m.buttonsResponseMessage?.selectedButtonId ||
    m.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m.ephemeralMessage?.message?.extendedTextMessage?.text ||
    ''
  );
}

function getMsgType(msg) {
  const m = msg.message;
  if (!m) return '';
  return Object.keys(m)[0] || '';
}

function getQuoted(msg) {
  const ext = msg.message?.extendedTextMessage;
  if (!ext?.contextInfo?.quotedMessage) return null;
  return {
    message : ext.contextInfo.quotedMessage,
    sender  : ext.contextInfo.participant,
    stanzaId: ext.contextInfo.stanzaId,
  };
}

// ══════════════════════════════════════════════════════════════════════
//   GRUPOS
// ══════════════════════════════════════════════════════════════════════

function isGroup(jid)     { return jid?.endsWith('@g.us') || false; }
function isBroadcast(jid) { return jid?.endsWith('@broadcast') || false; }

function getGroupAdmins(participants = []) {
  return participants
    .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    .map(p => normalizeJid(resolveLidSync(p.id)));
}

function getBotJid(sock) {
  if (!sock?.user?.id) return '';
  return normalizeJid(sock.user.id);
}

function isBotAdmin(sock, groupAdmins) {
  return groupAdmins.includes(getBotJid(sock));
}

// ══════════════════════════════════════════════════════════════════════
//   TIEMPO / FORMATO
// ══════════════════════════════════════════════════════════════════════

function formatUptime(ms) {
  const sec  = Math.floor(ms / 1000);
  const min  = Math.floor(sec / 60);
  const hr   = Math.floor(min / 60);
  const days = Math.floor(hr / 24);
  if (days > 0) return `${days}d ${hr % 24}h ${min % 60}m`;
  if (hr  > 0)  return `${hr}h ${min % 60}m ${sec % 60}s`;
  if (min > 0)  return `${min}m ${sec % 60}s`;
  return `${sec}s`;
}

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ══════════════════════════════════════════════════════════════════════
//   FOTO DE PERFIL (con fallback a foto por defecto de WA)
// ══════════════════════════════════════════════════════════════════════

/**
 * Obtiene la foto de perfil de un JID como Buffer.
 * Si no tiene foto, retorna null (el caller usará la imagen default).
 * @param {object} sock
 * @param {string} jid
 * @returns {Promise<Buffer|null>}
 */
async function getProfilePicBuffer(sock, jid) {
  try {
    const url = await sock.profilePictureUrl(jid, 'image');
    if (!url) return null;
    const axios = require('axios');
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
    return Buffer.from(res.data);
  } catch {
    return null; // Sin foto o error → el caller usará la default
  }
}

module.exports = {
  setStore, getStore,
  resolveLid, resolveLidSync, learnLidsFromParticipants,
  normalizeJid, getDisplayNumber,
  detectPrefix,
  getBody, getMsgType, getQuoted,
  isGroup, isBroadcast, getGroupAdmins, getBotJid, isBotAdmin,
  formatUptime, getRandom, sleep,
  getProfilePicBuffer,
};
