import axios from 'axios';

/**
 * WhatsApp Notification Utility for Tusmo School
 * This utility handles sending automated messages to parents and students.
 */

interface WhatsAppMessage {
  phone: string;
  message: string;
}

const GATEWAY_URL = process.env.WHATSAPP_GATEWAY_URL || 'http://localhost:3001';

/**
 * Sends a message via the local WhatsApp Gateway.
 * It will retry or queue according to the gateway's logic.
 */
export async function sendWhatsAppNotification({ phone, message }: WhatsAppMessage) {
  try {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) return { success: false, error: "Invalid phone number" };

    const response = await axios.post(`${GATEWAY_URL}/send-message`, {
      phone: cleanPhone,
      message: message
    });

    console.log(`[WhatsApp Sync] To: ${cleanPhone} | Status: ${response.data.status}`);
    return { success: true, provider: "WhiskeySockets_Gateway", queueLength: response.data.queueLength };
  } catch (error: any) {
    console.error("WhatsApp delivery failed (Gateway unreachable):", error.message);
    // Fallback if gateway is down: Log it
    return { success: false, error: "Gateway unreachable" };
  }
}

/**
 * Generates a pre-filled WhatsApp link for manual overrides
 */
export function generateWhatsAppLink(phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}
