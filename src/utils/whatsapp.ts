/**
 * WhatsApp Notification Utility for Tusmo School
 * This utility handles sending automated messages to parents and students.
 */

interface WhatsAppMessage {
  phone: string;
  message: string;
}

/**
 * In a production environment, you would integrate with a service like Twilio, 
 * Infobip, or a custom WhatsApp Business API gateway.
 */
export async function sendWhatsAppNotification({ phone, message }: WhatsAppMessage) {
  try {
    // Sanitize phone number (ensure no + or spaces if using specific APIs)
    const cleanPhone = phone.replace(/\D/g, "");
    
    console.log(`[WhatsApp Sync] To: ${cleanPhone} | Msg: ${message}`);

    /**
     * Simulation of an API Call. 
     * In a real app, you'd do:
     * const response = await fetch('https://api.provider.com/send', {
     *   method: 'POST',
     *   body: JSON.stringify({ to: cleanPhone, text: message }),
     *   headers: { 'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}` }
     * });
     */
    
    // For now, we simulate success
    return { success: true, provider: "Simulated_Gateway" };
  } catch (error) {
    console.error("WhatsApp delivery failed:", error);
    return { success: false, error };
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
