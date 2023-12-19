const dotenv = require('dotenv');
const twilio = require('twilio');

class Notifications{
    // send notification message
    static async sendNotificationMessage(message, to) {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
        try {
            const response = await client.messages.create({
                body: message,
                from: process.env.TWILIO_NUMBER,
                to: to
            });
    
            return response;
        } catch (error) {
            // Handle errors if needed
            console.error('Error sending Twilio message:', error);
            throw error;
        }
    }
}

module.exports = Notifications