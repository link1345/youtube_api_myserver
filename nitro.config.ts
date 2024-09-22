//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  runtimeConfig: {
    youtubeKey: "dev_youtube_key",
  },
  experimental: {
    tasks: true,
    database: true
  },
  "tasks": {
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
