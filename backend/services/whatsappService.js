import twilio from 'twilio';

/**
 * Normalize phone to E.164 for WhatsApp: digits only, then ensure + prefix.
 * e.g. "91 98765 43210" -> "+919876543210"
 */
function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return digits.startsWith('0') ? null : `+${digits}`;
}

/**
 * Send a WhatsApp message via Twilio.
 * Requires env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM.
 *
 * TWILIO_WHATSAPP_FROM must be a WhatsApp-enabled sender in your Twilio account:
 * - For testing: use the Sandbox number from Twilio Console → Messaging → Try it out → Send a WhatsApp message (e.g. +14155238886).
 * - Recipients must first send "join <sandbox-code>" to that number in WhatsApp.
 * - For production: use your approved WhatsApp Business sender number from Messaging → Senders.
 * A normal Twilio phone number (SMS/Voice only) will cause "could not find a Channel with the specified From address".
 *
 * @param {string} toPhone - User phone with country code (e.g. 919876543210 or +919876543210)
 * @param {string} body - Message text
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendWhatsAppMessage(toPhone, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn('WhatsApp: Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_FROM. Skip sending.');
    return { success: false, error: 'WhatsApp not configured' };
  }

  const to = normalizePhone(toPhone);
  if (!to) {
    return { success: false, error: 'Invalid phone number' };
  }

  const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromWhatsApp = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body,
      from: fromWhatsApp,
      to: toWhatsApp,
    });
    return { success: true };
  } catch (err) {
    console.error('WhatsApp send error:', err?.message || err);
    return { success: false, error: err?.message || 'Send failed' };
  }
}
