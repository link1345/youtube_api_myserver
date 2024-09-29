import { getYoutube } from "~/util"

export default defineEventHandler(event => {
    const name = getRouterParam(event, 'name');

    // 指定 : ビデオタイプ (all = すべて , video = 録画 , liveNow = ライブ中 , liveBefore = ライブ前 , liveAfter = ライブ後)
    const type = getRequestURL(event).searchParams.get("type") !== null ? getRequestURL(event).searchParams.get("type") : "all";

    return getYoutube(type, name).map(e => ({ ...e, url: `https://www.youtube.com/watch?v=${e.videoId}` }));
})