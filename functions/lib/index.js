"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNewChatMessage = exports.onTestNotification = void 0;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-functions/v2/firestore");
const params_1 = require("firebase-functions/params");
const nodemailer = __importStar(require("nodemailer"));
admin.initializeApp();
const gmailPass = (0, params_1.defineSecret)('GMAIL_APP_PASSWORD');
const ADMIN_EMAIL = 'egds.dev@gmail.com';
const ADMIN_URL = 'https://egdsdev.github.io/portfolio/admin';
// ── Teste de email/push disparado pelo painel admin ──────────────────────────
exports.onTestNotification = (0, firestore_1.onDocumentCreated)({
    document: 'test_notifications/{docId}',
    secrets: [gmailPass],
    region: 'us-central1',
}, async (event) => {
    var _a, _b, _c;
    const data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!data)
        return;
    const db = admin.firestore();
    const docRef = db.doc(`test_notifications/${event.params['docId']}`);
    const type = (_b = data['type']) !== null && _b !== void 0 ? _b : 'email';
    try {
        // ── Push ───────────────────────────────────────────────────────────
        if (type === 'push' || type === 'both') {
            const tokenSnap = await db.doc('admin_config/notifications').get();
            const fcmToken = (_c = tokenSnap.data()) === null || _c === void 0 ? void 0 : _c['fcmToken'];
            if (fcmToken) {
                await admin.messaging().send({
                    token: fcmToken,
                    notification: {
                        title: data['title'] || '🧪 Teste de push',
                        body: data['body'] || 'Push notification funcionando!',
                    },
                    webpush: { fcmOptions: { link: ADMIN_URL } },
                });
            }
        }
        // ── Email ──────────────────────────────────────────────────────────
        if (type === 'email' || type === 'both') {
            const subject = data['subject'] || '🧪 Teste de email — Portfolio Admin';
            const bodyText = data['body'] || 'Email de teste funcionando!';
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: ADMIN_EMAIL, pass: gmailPass.value() },
            });
            await transporter.sendMail({
                from: `"Portfolio Admin" <${ADMIN_EMAIL}>`,
                to: ADMIN_EMAIL,
                subject,
                html: `
            <div style="font-family:ui-sans-serif,sans-serif;max-width:500px;margin:0 auto">
              <div style="background:#0e7490;padding:20px 24px;border-radius:12px 12px 0 0">
                <h2 style="color:#fff;margin:0;font-size:18px">🧪 Email de teste — Admin</h2>
              </div>
              <div style="background:#0f172a;padding:20px 24px;border-radius:0 0 12px 12px">
                <p style="color:#94a3b8;margin:0 0 4px;font-size:13px;font-weight:600">ASSUNTO</p>
                <p style="color:#fff;margin:0 0 16px;font-size:15px">${subject}</p>
                <p style="color:#94a3b8;margin:0 0 4px;font-size:13px;font-weight:600">MENSAGEM</p>
                <p style="color:#e2e8f0;margin:0 0 20px;font-size:14px;line-height:1.6">${bodyText}</p>
                <a href="${ADMIN_URL}"
                   style="display:inline-block;background:#0e7490;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
                  Abrir painel Admin →
                </a>
              </div>
            </div>
          `,
            });
        }
        await docRef.update({ status: 'sent' });
        console.log(`[TestNotification] type=${type} enviado com sucesso`);
    }
    catch (err) {
        console.error('[TestNotification] Erro:', err);
        await docRef.update({ status: 'error', error: String(err) });
    }
});
// ── Nova mensagem de chat ─────────────────────────────────────────────────────
exports.onNewChatMessage = (0, firestore_1.onDocumentCreated)({
    document: 'chat_conversations/{convId}/messages/{msgId}',
    secrets: [gmailPass],
    region: 'us-central1',
}, async (event) => {
    var _a, _b, _c;
    const data = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!data || data['sender'] !== 'visitor')
        return;
    const convId = event.params['convId'];
    const text = data['text'];
    const db = admin.firestore();
    // Busca dados da conversa para saber o nome/empresa
    const convSnap = await db.doc(`chat_conversations/${convId}`).get();
    const conv = convSnap.data();
    const username = (_b = conv === null || conv === void 0 ? void 0 : conv['username']) !== null && _b !== void 0 ? _b : 'Visitante';
    const company = conv === null || conv === void 0 ? void 0 : conv['company'];
    const displayName = company ? `${username} · ${company}` : username;
    const shortText = text.length > 120 ? text.slice(0, 117) + '...' : text;
    // ── Throttle de email: 1 por hora por conversa ────────────────────────
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const lastEmailSentAt = conv === null || conv === void 0 ? void 0 : conv['lastEmailSentAt'];
    const shouldSendEmail = !lastEmailSentAt ||
        Date.now() - lastEmailSentAt.toMillis() >= ONE_HOUR_MS;
    if (shouldSendEmail) {
        await db.doc(`chat_conversations/${convId}`).update({
            lastEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
    // ── 1. Push Notification (FCM) ────────────────────────────────────────
    try {
        const tokenSnap = await db.doc('admin_config/notifications').get();
        const fcmToken = (_c = tokenSnap.data()) === null || _c === void 0 ? void 0 : _c['fcmToken'];
        if (fcmToken) {
            await admin.messaging().send({
                token: fcmToken,
                notification: {
                    title: `💬 ${displayName}`,
                    body: shortText,
                },
                webpush: {
                    fcmOptions: { link: ADMIN_URL },
                    notification: {
                        icon: 'https://egdsdev.github.io/portfolio/favicon.svg',
                        badge: 'https://egdsdev.github.io/portfolio/favicon.svg',
                        requireInteraction: true,
                    },
                },
            });
            console.log(`[FCM] Push enviado para ${displayName}`);
        }
    }
    catch (err) {
        console.error('[FCM] Erro ao enviar push:', err);
    }
    // ── 2. Email (Nodemailer + Gmail) ─────────────────────────────────────
    if (shouldSendEmail) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: ADMIN_EMAIL,
                    pass: gmailPass.value(),
                },
            });
            await transporter.sendMail({
                from: `"Portfolio Chat" <${ADMIN_EMAIL}>`,
                to: ADMIN_EMAIL,
                subject: `💬 Nova mensagem de ${displayName}`,
                html: `
          <div style="font-family:ui-sans-serif,sans-serif;max-width:500px;margin:0 auto">
            <div style="background:#7c3aed;padding:20px 24px;border-radius:12px 12px 0 0">
              <h2 style="color:#fff;margin:0;font-size:18px">💬 Nova mensagem no portfólio</h2>
            </div>
            <div style="background:#1e1b4b;padding:20px 24px;border-radius:0 0 12px 12px">
              <p style="color:#c4b5fd;margin:0 0 4px;font-size:13px;font-weight:600">DE</p>
              <p style="color:#fff;margin:0 0 16px;font-size:15px;font-weight:700">${displayName}</p>
              <a href="${ADMIN_URL}"
                 style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">
                Responder no Admin →
              </a>
            </div>
          </div>
        `,
            });
            console.log(`[Email] Enviado para ${ADMIN_EMAIL} (de ${displayName})`);
        }
        catch (err) {
            console.error('[Email] Erro ao enviar:', err);
        }
    } // fim shouldSendEmail
});
//# sourceMappingURL=index.js.map