import Sqlite, { Database } from "better-sqlite3";
import { google, youtube_v3 } from "googleapis";
import { getMembers, setYoutube } from "~/util";

export default defineTask({
    meta: {
        name: "youtube:search",
        description: "Run youtube search task",
    },
    run({ payload, context }) {
        runYoutube();
        return { result: "Success" };
    },
});


async function getYoutubeSearchVideo(youtube: youtube_v3.Youtube, channelId: string): Promise<
    {
        mode: "update";
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
    }[]> {
    const result = await youtube.search.list({
        key: useRuntimeConfig().youtubeKey,
        part: ["snippet"],
        channelId: channelId,
        type: ["video"],
        maxResults: 5
    });
    if (result.status !== 200) {
        return [];
    }
    const videos = result.data.items.map(e => e.id.videoId);
    if (videos.length === 0) {
        return [];
    }

    await new Promise(resolve => setTimeout(resolve, 3000));

    const resultVideos = await youtube.videos.list({
        key: useRuntimeConfig().youtubeKey,
        part: ["snippet", "liveStreamingDetails"],
        id: videos,
    });

    return resultVideos.data.items.map((e) => (
        {
            mode: "update",
            videoId: e.id,
            channelId: channelId,
            title: e.snippet.title,
            channelTitle: e.snippet.channelTitle,
            description: e.snippet.description,
            thumbnail: e.snippet.thumbnails.medium.url,
            // liveBroadcastContent ... live: ライブ中 , upcoming: ライブ前 , none: ライブ or ライブ後
            liveBroadcast: e.snippet.liveBroadcastContent,
            // scheduledStartTime ... ライブ予定
            liveScheduledStartTime: e.liveStreamingDetails ? e.liveStreamingDetails.scheduledStartTime : "",
            // actualStartTime ... ライブ開始(実際)
            liveActualStartTime: e.liveStreamingDetails ? e.liveStreamingDetails.actualStartTime : "",
            // actualStartTime ... ライブ終了(実際)
            liveActualEndTime: e.liveStreamingDetails ? e.liveStreamingDetails.actualEndTime : ""
        }
    ));
}

async function getYoutube() {
    const youtube: youtube_v3.Youtube = google.youtube('v3');

    for (const member of getMembers()) {
        for (const id of JSON.parse(member.youtube_channel_id)) {
            const search = await getYoutubeSearchVideo(youtube, id);
            setYoutube("insert", member.name, search);
        }

    }

}

function runYoutube() {
    console.log("Running [youtube:search] task...");
    getYoutube();
    console.log("End [youtube:search]");
}