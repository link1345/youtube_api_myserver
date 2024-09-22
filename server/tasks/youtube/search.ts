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


async function getYoutubeSearchVideo(youtube: youtube_v3.Youtube, channelId: string): Promise<{
    videoId: string,
    channelTitle: string,
    title: string,
    description: string,
    thumbnail: string,
    liveBroadcast: string
}[]> {
    const result = await youtube.search.list({
        key: useRuntimeConfig().youtubeKey,
        part: ["snippet"],
        channelId: channelId,
        type: ["video"],
        maxResults: 5
    });
    return result.data.items.map(e => ({
        videoId: e.id.videoId,
        title: e.snippet.title,
        channelTitle: e.snippet.channelTitle,
        description: e.snippet.description,
        thumbnail: e.snippet.thumbnails.medium.url,
        liveBroadcast: e.snippet.liveBroadcastContent
    }));
}

function setData() {

}

async function getYoutube() {
    const youtube: youtube_v3.Youtube = google.youtube('v3');

    for (const member of getMembers()) {
        for (const channelId of member.youtube_channel_id) {
            const search = await getYoutubeSearchVideo(youtube, channelId);
            setYoutube(member.name, search);
        }
    }

}

function runYoutube() {
    console.log("Running youtube task...");
}