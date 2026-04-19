import * as admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

const gmailPass = defineSecret('GMAIL_APP_PASSWORD');

const ADMIN_EMAIL = 'egds.dev@gmail.com';
const ADMIN_URL = 'https://egdsdev.github.io/portfolio/admin';

export const onNewChatMessage = onDocumentCreated(
  {
    document: 'chat_conversations/{convId}/messages/{msgId}',
    secrets: [gmailPass],
    region: 'us-central1',
  },
  async (event) => {
    const data = event.data?.data();
    if (!data || data['sender'] !== 'visitor') return;

    const convId = event.params['convId'];
    const text = data['text'] as string;
    const db = admin.firestore();

    // Busca dados da conversa para saber o nome/empresa
    const convSnap = await db.doc(`chat_conversations/${convId}`).get();
    const conv = convSnap.data();
    const username = conv?.['username'] ?? 'Visitante';
    const company = conv?.['company'] as string | undefined;
    const displayName = company ? `${username} · ${company}` : username;
    const shortText = text.length > 120 ? text.slice(0, 117) + '...' : text;

    // ── Throttle de email: 1 por hora por conversa ────────────────────────
    const ONE_HOUR_MS = 60 * 60 * 1000;
    const lastEmailSentAt = conv?.['lastEmailSentAt'] as admin.firestore.Timestamp | undefined;
    const shouldSendEmail =
      !lastEmailSentAt ||
      Date.now() - lastEmailSentAt.toMillis() >= ONE_HOUR_MS;

    if (shouldSendEmail) {
      await db.doc(`chat_conversations/${convId}`).update({
        lastEmailSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // ── 1. Push Notification (FCM) ────────────────────────────────────────
    try {
      const tokenSnap = await db.doc('admin_config/notifications').get();
      const fcmToken = tokenSnap.data()?.['fcmToken'] as string | undefined;
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
    } catch (err) {
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
    } catch (err) {
      console.error('[Email] Erro ao enviar:', err);
    }
    } // fim shouldSendEmail
  }
);
