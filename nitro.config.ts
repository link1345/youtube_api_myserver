//https://nitro.unjs.io/config
export default defineNitroConfig({
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'access-control-allow-methods': 'GET',
        'Access-Control-Allow-Origin': '*',
        'Strict-Transport-Security': 'max-age=0'
      }
    },
  },
  srcDir: "server",
  runtimeConfig: {
    youtubeKey: "dev_youtube_key",
  },
  experimental: {
    tasks: true,
    database: true
  },
  tasks: {
    "youtube:search": {
      "description": "Run youtube search"
    },
    "youtube:video": {
      "description": "Run youtube video"
    },
    "db:migrate": {
      "description": "Run database migrations"
    }
  },
  scheduledTasks: {
    '30 */12 * * *': ['youtube:search'],
    '0 */1 * * *': ['youtube:video'],
  },
  database: {
    default: {
      connector: 'sqlite',
      options: { name: 'db' }
    },
  }
});
