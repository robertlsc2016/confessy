// whatsapp.js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("baileys");
const P = require("pino");

let sock = null;
let isConnected = false;

async function initializeWhatsApp() {
  console.log("iniciando sessao do zap");

  if (sock && isConnected) return sock;

  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: "silent" }),
  });

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("Escaneie o QR code com o WhatsApp:", qr);
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;
      console.log(
        "Conexão fechada:",
        lastDisconnect?.error,
        "Reconectando:",
        shouldReconnect
      );
      isConnected = false;
      if (shouldReconnect) {
        initializeWhatsApp();
      }
    } else if (connection === "open") {
      console.log("Conectado ao WhatsApp com sucesso!");
      isConnected = true;
    }
  });

  // sock.ev.on("messages.upsert", async (m) => {
  //   const msg = m.messages[0];
  //   if (msg.key.remoteJid.endsWith("@g.us")) {
  //     console.log("Mensagem de grupo detectada:");
  //     console.log(`ID do grupo: ${msg.key.remoteJid}`);
  //   }
  // });

  // sock.ev.on("messages.upsert", async (m) => {
  //   const msg = m.messages[0];
  //   console.log("Mensagem de grupo detectada:");
  //   console.log(`ID do grupo: ${msg.key.remoteJid}`);
  // });
  sock.ev.on("creds.update", saveCreds);
  return sock;
}

async function sendWhatsAppMessage(to, message) {
  try {
    const socket = await initializeWhatsApp();
    await socket.sendMessage(to, { text: message });
    
    console.log(`Mensagem enviada para ${to}: ${message}`);
    return { success: true, message: "Mensagem enviada com sucesso!" };
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { initializeWhatsApp, sendWhatsAppMessage };
