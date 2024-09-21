export default defineNitroPlugin(async (nitroApp) => {
    console.log('start ... ')
    const result = await runTask('db:migrate');
})