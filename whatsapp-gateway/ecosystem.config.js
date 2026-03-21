module.exports = {
  apps: [{
    name: 'whatsapp-gateway',
    script: 'npx ts-node gateway.ts',
    watch: false,
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      WHATSAPP_PORT: 3001
    }
  }]
};
