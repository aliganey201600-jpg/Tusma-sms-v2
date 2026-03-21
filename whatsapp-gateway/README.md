# WhatsApp Automation Gateway for Tusmo School

This is a dedicated Node.js service that handles the WhatsApp Web socket connection using `@whiskeysockets/baileys`. 

## Setup Instructions

1. **Install Dependencies**:
   ```bash
   cd whatsapp-gateway
   npm install
   ```

2. **Database Sync**:
   Ensures the gateway has access to the Prisma client:
   ```bash
   npx prisma generate --schema=../prisma/schema.prisma
   ```

3. **Start the Service**:
   For development:
   ```bash
   npx ts-node gateway.ts
   ```

   For production (using PM2):
   ```bash
   pm2 start ecosystem.config.js
   ```

## Key Features
- **Multi-device Auth**: Scan once, stay connected. Session is stored in `auth_info_baileys/`.
- **Anti-Ban Protection**: Random 5-10 second delay between bulk messages.
- **Status Sync**: Automatically updates the `WhatsAppConfig` model in your database so the Admin Dashboard stays in sync.
- **REST API**: Listen on port 3001 for `/send-message` requests from the main application.

## Troubleshooting
- If the QR code doesn't appear in the terminal, check your firewall settings for port 3001.
- If you get a "Logged Out" error, delete the `auth_info_baileys` folder and restart the service to generate a new QR.
