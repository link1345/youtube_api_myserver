import Sqlite, { Database } from "better-sqlite3";


export function getMembers(): { name: string, display_name: string, youtube_channel_id: string }[] {
    const db = Sqlite('.data/vgeek.db');

    const selectMemberQuery = db.prepare('SELECT name , display_name , youtube_channel_id FROM members');

    const resultStringify = JSON.stringify(selectMemberQuery.all());
    const result = JSON.parse(resultStringify);
    db.close();
    return result;
}


export function getVideoIds(): { name: string, videoId: string }[] {
    const db = Sqlite('.data/vgeek.db');

    const selectVideoQuery = db.prepare('SELECT name , videoId FROM youtube_video WHERE liveBroadcast = ?');

    // ライブ中取得
    const liveVideos = JSON.parse(JSON.stringify(selectVideoQuery.all("live")));

    // ライブ前取得
    const upcomingVideos = JSON.parse(JSON.stringify(selectVideoQuery.all("upcoming")));

    console.log("live or upcoming : ", [...upcomingVideos, ...liveVideos]);

    db.close();
    return [...upcomingVideos, ...liveVideos];
}

export function setYoutube(mode: "updateOnly" | "insert", name: string, data: (
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
    } |
    { mode: "remove", videoId: string })[]) {
    const db = Sqlite('.data/vgeek.db');

    const insertYoutubeQuery = db.prepare(`INSERT INTO youtube_video VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const updateYoutubeQuery = db.prepare(`UPDATE youtube_video SET title = ?, channelTitle = ?, description = ?, thumbnail = ?, liveBroadcast = ?, liveScheduledStartTime = ?, liveActualStartTime = ?, liveActualEndTime = ? WHERE videoId = ?`);
    const removeYoutubeQuery = db.prepare(`DELETE FROM youtube_video WHERE videoId = ?`);

    const checkLiveFlagVideoQuery = db.prepare('SELECT liveBroadcast FROM youtube_video WHERE videoId = ?');

    for (const item of data) {

        const checkLiveFlagVideo = checkLiveFlagVideoQuery.get(item.videoId);
        // ビデオが登録済みで、かつ「ライブではない」or「配信済み」ならば何もしない
        if (checkLiveFlagVideo !== undefined && checkLiveFlagVideo["liveBroadcast"] !== undefined && checkLiveFlagVideo["liveBroadcast"] === "none") {
            console.log("Break!");
            continue;
        }

        // 404エラーなどが出てきたら、削除する
        if (item.mode === "remove") {
            removeYoutubeQuery.run(item.videoId);
            continue;
        }

        // 未登録ならば、登録する
        if (checkLiveFlagVideo === undefined) {
            insertYoutubeQuery.run(
                item.videoId,
                name,
                item.title,
                item.channelTitle,
                item.description,
                item.thumbnail,
                item.liveBroadcast,
                item.liveScheduledStartTime,
                item.liveActualStartTime,
                item.liveActualEndTime
            );
            continue;
        }

        // 登録済みならば、更新する
        updateYoutubeQuery.run(
            item.title, item.channelTitle, item.description, item.thumbnail,
            item.liveBroadcast, item.liveScheduledStartTime, item.liveActualStartTime, item.liveActualEndTime,
            item.videoId);
    }
    db.close();
}


export function getYoutube(name: string) {
    const db = Sqlite('.data/vgeek.db');
    const selectVideoQuery = db.prepare('SELECT channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE name = ?');

    const result = selectVideoQuery.all(name);
    if (result === undefined) {
        return [];
    }

    return JSON.parse(JSON.stringify(result));
}