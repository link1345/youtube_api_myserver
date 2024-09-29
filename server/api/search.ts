import { getAllYoutube, getYoutube, video } from "~/util"

export default defineEventHandler(event => {

    // 指定 : 配信者
    const paramsName = getRequestURL(event).searchParams.get("name") !== null ? getRequestURL(event).searchParams.get("name").split(",") : [];

    // 指定 : ビデオタイプ (all = すべて , video = 録画 , liveNow = ライブ中 , liveBefore = ライブ前 , liveAfter = ライブ後)
    const type = getRequestURL(event).searchParams.get("type") !== null ? getRequestURL(event).searchParams.get("type") : "all";

    if (paramsName.length === 0) {
        return getAllYoutube(type);
    }

    let youtubeItems: video[] = [];
    for (const item of paramsName) {
        youtubeItems = youtubeItems.concat(getYoutube(type, item));
    }

    return youtubeItems.map(e => ({ ...e, url: `https://www.youtube.com/watch?v=${e.videoId}` }));
})