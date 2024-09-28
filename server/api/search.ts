import { getYoutube, video } from "~/util"

export default defineEventHandler(event => {
    console.log(getRequestURL(event).searchParams.get("name").split(","));

    let youtubeItems: video[] = [];
    for (const item of getRequestURL(event).searchParams.get("name").split(",")) {
        youtubeItems = youtubeItems.concat(getYoutube(item));
    }
    return youtubeItems.sort((a, b) => (new Date(a.publishedAt)).getTime() - (new Date(b.publishedAt)).getTime());
})