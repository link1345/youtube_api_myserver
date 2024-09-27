export default defineNitroPlugin(async (nitroApp) => {
    console.log('start ... ')
    await runTask('db:migrate');
    //await runTask('youtube:search');
    //await runTask('youtube:video');
})