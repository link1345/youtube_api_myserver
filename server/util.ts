import Sqlite, { Database } from "better-sqlite3";


export function getMembers(): { name: string, display_name: string, youtube_channel_id: string[] }[] {
    const db = Sqlite('.data/vgeek.db');

    const selectMemberQuery = db.prepare('SELECT name , display_name , youtube_channel_id FROM members');

    const result = JSON.parse(selectMemberQuery.all().toString());
    db.close();

    return result;
}

export function setYoutube(name: string, data: {
    videoId: string,
    channelTitle: string,
    title: string,
    description: string,
    thumbnail: string,
    liveBroadcast: string
}[]) {
    // まだ書いてないよ！！！
    // DBへyoutubeのビデオ情報を入れ込んでね！ 
}