export default defineTask({
    meta: {
        name: "youtube",
        description: "Run youtube task",
    },
    run({ payload, context }) {
        run_youtube();
        return { result: "Success" };
    },
});

function run_youtube() {
    console.log("Running youtube task...");
}