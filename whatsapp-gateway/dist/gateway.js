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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const pino_1 = __importDefault(require("pino"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: '../.env' }); // Use root .env
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const logger = (0, pino_1.default)({ level: 'info' });
let sock = null;
let qrText = null;
let connectionStatus = "DISCONNECTED";
async function connectToWhatsApp() {
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)('auth_info_baileys');
    const { version } = await (0, baileys_1.fetchLatestBaileysVersion)();
    sock = (0, baileys_1.default)({
        version,
        auth: {
            creds: state.creds,
            keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger),
        },
        logger,
        browser: ["Tusmo SMS", "Chrome", "1.0.0"],
        printQRInTerminal: true,
    });
    sock.ev.on('connection.update', async (update) => {
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
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== baileys_1.DisconnectReason.loggedOut;
            connectionStatus = "DISCONNECTED";
            await prisma.whatsAppConfig.upsert({
                where: { id: 'default' },
                create: { id: 'default', status: 'DISCONNECTED' },
                update: { status: 'DISCONNECTED', qrCode: null }
            }).catch(e => console.error("DB error (CLOSE):", e));
            if (shouldReconnect)
                connectToWhatsApp();
        }
        else if (connection === 'open') {
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
const messageQueue = [];
let isProcessing = false;
async function processQueue() {
    if (isProcessing || messageQueue.length === 0)
        return;
    isProcessing = true;
    while (messageQueue.length > 0) {
        if (connectionStatus !== "CONNECTED") {
            console.log("Waiting for connection to reconnect...");
            await new Promise(r => setTimeout(r, 5000));
            continue;
        }
        const { phone, message } = messageQueue.shift();
        try {
            let cleanPhone = phone.replace(/\D/g, "");
            const id = `${cleanPhone}@s.whatsapp.net`;
            await sock.sendMessage(id, { text: message });
            console.log(`[Sent] To: ${cleanPhone}`);
        }
        catch (err) {
            console.error(`[Failed] To: ${phone}:`, err);
        }
        const delay = Math.floor(Math.random() * 5000) + 5000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    isProcessing = false;
}
app.post('/send-message', (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
        res.status(400).json({ error: 'phone and message are required' });
        return;
    }
    messageQueue.push({ phone, message });
    processQueue();
    res.json({ success: true, status: 'queued', queueLength: messageQueue.length });
});
app.get('/status', (req, res) => {
    res.json({ status: connectionStatus, qr: qrText, queue: messageQueue.length });
});
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`WhatsApp Gateway Server listening on port ${PORT}`);
    connectToWhatsApp().catch(e => console.error("Connection Error:", e));
});
