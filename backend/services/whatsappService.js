import twilio from 'twilio';

/**
 * Twilio WhatsApp notification setup (see .env):
 * - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN: Twilio credentials
 * - TWILIO_WHATSAPP_FROM: WhatsApp sender (e.g. whatsapp:+919289789721)
 * - TWILIO_WHATSAPP_FROM_NAME: Display name for the sender (e.g. ColorSmith)
 * - TWILIO_TEMPLATE_ID: Optional Content SID for approved WhatsApp templates (e.g. HX32b5...)
 *
 * TWILIO_WHATSAPP_FROM must be a WhatsApp-enabled sender:
 * - Testing: Sandbox number from Twilio Console → Messaging → Try it out
 * - Production: Approved WhatsApp Business sender from Messaging → Senders
 */

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

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
  if (!accountSid || !authToken || !fromNumber) return null;
  return { client: twilio(accountSid, authToken), fromNumber };
}

/**
 * Send a free-form WhatsApp message via Twilio.
 * Uses: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM.
 *
 * @param {string} toPhone - User phone with country code (e.g. 919876543210 or +919876543210)
 * @param {string} body - Message text
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendWhatsAppMessage(toPhone, body) {
  const twilioConfig = getTwilioClient();
  if (!twilioConfig) {
    console.warn('WhatsApp: Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, or TWILIO_WHATSAPP_FROM. Skip sending.');
    return { success: false, error: 'WhatsApp not configured' };
  }

  const to = normalizePhone(toPhone);
  if (!to) {
    return { success: false, error: 'Invalid phone number' };
  }

  const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromWhatsApp = twilioConfig.fromNumber.startsWith('whatsapp:') ? twilioConfig.fromNumber : `whatsapp:${twilioConfig.fromNumber}`;

  try {
    await twilioConfig.client.messages.create({
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

/**
 * Send a WhatsApp message using an approved Content Template (TWILIO_TEMPLATE_ID).
 * Use when you have a pre-approved template in Twilio; contentVariables keys must match
 * your template placeholders (e.g. { "1": "CustomerName", "2": "OrderNumber" }).
 *
 * @param {string} toPhone - User phone with country code
 * @param {Record<string, string>} contentVariables - Template variables (e.g. { "1": "John", "2": "Order #123" })
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendWhatsAppTemplate(toPhone, contentVariables) {
  const twilioConfig = getTwilioClient();
  const contentSid = process.env.TWILIO_TEMPLATE_ID;

  if (!twilioConfig) {
    console.warn('WhatsApp: Missing Twilio credentials. Skip sending.');
    return { success: false, error: 'WhatsApp not configured' };
  }
  if (!contentSid) {
    console.warn('WhatsApp: TWILIO_TEMPLATE_ID not set. Use sendWhatsAppMessage for free-form or set template in .env.');
    return { success: false, error: 'Template not configured' };
  }

  const to = normalizePhone(toPhone);
  if (!to) {
    return { success: false, error: 'Invalid phone number' };
  }

  const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
  const fromWhatsApp = twilioConfig.fromNumber.startsWith('whatsapp:') ? twilioConfig.fromNumber : `whatsapp:${twilioConfig.fromNumber}`;

  try {
    await twilioConfig.client.messages.create({
      from: fromWhatsApp,
      to: toWhatsApp,
      contentSid,
      contentVariables: JSON.stringify(contentVariables || {}),
    });
    return { success: true };
  } catch (err) {
    console.error('WhatsApp template send error:', err?.message || err);
    return { success: false, error: err?.message || 'Send failed' };
  }
}
