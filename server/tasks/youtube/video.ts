import Sqlite, { Database } from "better-sqlite3";
import { google, youtube_v3 } from "googleapis";

export default defineTask({
    meta: {
        name: "youtube:video",
        description: "Run youtube video task",
    },
    run({ payload, context }) {
        runYoutube();
        return { result: "Success" };
    },
});


async function getYoutubeVideo(youtube: youtube_v3.Youtube, videoIds: string[]) {
    const result = await youtube.videos.list({
        key: useRuntimeConfig().youtubeKey,
        part: ["snippet", "liveStreamingDetails"],
        id: videoIds,
    });

    return result.data.items.map(e => ({
        channelId: e.snippet.channelId,
        title: e.snippet.title,
        channelTitle: e.snippet.channelTitle,
        description: e.snippet.description,
        thumbnails: e.snippet.thumbnails.medium.url,
        liveBroadcast: e.snippet.liveBroadcastContent,
        liveScheduledStartTime: e.liveStreamingDetails.scheduledStartTime,
        liveActualStartTime: e.liveStreamingDetails.actualStartTime,
        liveActualEndTime: e.liveStreamingDetails.actualEndTime
    }));
}

function getYoutube() {
    const youtube: youtube_v3.Youtube = google.youtube('v3');
    getYoutubeVideo(youtube, ["test"]); // ---------------------------- [仮]
}

function runYoutube() {
    console.log("Running youtube task...");
}