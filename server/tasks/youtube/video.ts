import Sqlite, { Database } from "better-sqlite3";
import { google, youtube_v3 } from "googleapis";
import { getVideoIds, setYoutube } from "~/util";

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


async function getYoutubeVideo(youtube: youtube_v3.Youtube, videoId: string): Promise<(
    {
        mode: "update";
        publishedAt: string,
        videoId: string;
        channelId: string;
        title: string;
        channelTitle: string;
        description: string;
        thumbnail: string;
        liveBroadcast: string;
        liveScheduledStartTime: string;
        liveActualStartTime: string;
        liveActualEndTime: string;
    } |
    { mode: "remove", videoId: string })[]> {
    const result = await youtube.videos.list({
        key: useRuntimeConfig().youtubeKey,
        part: ["snippet", "liveStreamingDetails"],
        id: [videoId],
    });
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (result.status === 404 || result.status === 403) {
        return [{ mode: "remove", videoId: videoId }]
    }
    if (result.status !== 200) {
        return [];
    }

    return result.data.items.map(e => ({
        mode: "update",
        videoId: e.id,
        publishedAt: e.snippet.publishedAt,
        channelId: e.snippet.channelId,
        title: e.snippet.title,
        channelTitle: e.snippet.channelTitle,
        description: e.snippet.description,
        thumbnail: e.snippet.thumbnails.medium.url,
        // liveBroadcastContent ... live: ライブ中 , upcoming: ライブ前 , none: ライブ or ライブ後
        liveBroadcast: e.snippet.liveBroadcastContent,
        // scheduledStartTime ... ライブ予定
        liveScheduledStartTime: e.liveStreamingDetails.scheduledStartTime,
        // actualStartTime ... ライブ開始(実際)
        liveActualStartTime: e.liveStreamingDetails.actualStartTime,
        // actualStartTime ... ライブ終了(実際)
        liveActualEndTime: e.liveStreamingDetails.actualEndTime
    }));
}

async function getYoutube() {
    const youtube: youtube_v3.Youtube = google.youtube('v3');

    const videoIds = getVideoIds();
    for (const item of videoIds) {
        const videos = await getYoutubeVideo(youtube, item.videoId);
        console.log("videos: ", videos)
        setYoutube("updateOnly", item.name, videos);
    }
}

function runYoutube() {
    console.log("Running [youtube:video] task...");
    getYoutube().then(() => {
        console.log("End [youtube:video]");
    });
}