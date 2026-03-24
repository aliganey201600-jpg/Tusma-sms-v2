import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import P from 'pino';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Use root .env

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

const logger = P({ level: 'info' });

let sock: any = null;
let qrText: string | null = null;
let connectionStatus: string = "DISCONNECTED";

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger),
        },
        logger,
        browser: ["Tusmo SMS", "Chrome", "1.0.0"],
        printQRInTerminal: true,
    });

    sock.ev.on('connection.update', async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrText = qr;
            console.log('--- QR CODE UPDATED ---');
            await prisma.whatsAppConfig.upsert({
                where: { id: 'default' },
                create: { id: 'default', status: 'DISCONNECTED', qrCode: qr },
                update: { qrCode: qr, status: 'DISCONNECTED' }
            }).catch(e => console.error("DB error (QR):", e));
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            connectionStatus = "DISCONNECTED";
            await prisma.whatsAppConfig.upsert({
                where: { id: 'default' },
                create: { id: 'default', status: 'DISCONNECTED' },
                update: { status: 'DISCONNECTED', qrCode: null }
            }).catch(e => console.error("DB error (CLOSE):", e));

            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            connectionStatus = "CONNECTED";
            qrText = null;
            await prisma.whatsAppConfig.upsert({
                where: { id: 'default' },
                create: { id: 'default', status: 'CONNECTED' },
                update: { status: 'CONNECTED', qrCode: null, lastConnected: new Date(), phoneNumber: sock.user?.id }
            }).catch(e => console.error("DB error (OPEN):", e));
            console.log('WhatsApp connection is OPEN');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

// Queue logic
const messageQueue: { phone: string, message: string }[] = [];
let isProcessing = false;

async function processQueue() {
    if (isProcessing || messageQueue.length === 0) return;
    isProcessing = true;

    while (messageQueue.length > 0) {
        if (connectionStatus !== "CONNECTED") {
            console.log("Waiting for connection to reconnect...");
            await new Promise(r => setTimeout(r, 5000));
            continue;
        }

        const { phone, message } = messageQueue.shift()!;
        try {
            let cleanPhone = phone.replace(/\D/g, "");
            const id = `${cleanPhone}@s.whatsapp.net`;
            
            await sock.sendMessage(id, { text: message });
            console.log(`[Sent] To: ${cleanPhone}`);
        } catch (err) {
            console.error(`[Failed] To: ${phone}:`, err);
        }
        
        const delay = Math.floor(Math.random() * 10000) + 10000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    isProcessing = false;
}

app.post('/send-message', (req: Request, res: Response) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
      res.status(400).json({ error: 'phone and message are required' });
      return;
    }
    
    messageQueue.push({ phone, message });
    processQueue();
    res.json({ success: true, status: 'queued', queueLength: messageQueue.length });
});

app.get('/status', (req: Request, res: Response) => {
    res.json({ status: connectionStatus, qr: qrText, queue: messageQueue.length });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`WhatsApp Gateway Server listening on port ${PORT}`);
    connectToWhatsApp().catch(e => console.error("Connection Error:", e));
});
