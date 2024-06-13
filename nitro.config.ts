//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: 'server',
  serverAssets: [{ baseName: 'templates', dir: './templates' }],
  experimental: {
    websocket: true,
  },
});
