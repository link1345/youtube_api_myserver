//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  experimental: {
    tasks: true,
    database: true
  },
  "tasks": {
    "youtube": {
      "description": "Run youtube"
    },
    "db:migrate": {
      "description": "Run database migrations"
    }
  },
  scheduledTasks: {
    // Run `cms:update` task every minute
    '* * * * *': ['youtube'],
  },
  database: {
    default: {
      connector: 'sqlite',
      options: { name: 'db' }
    },
  }
});
