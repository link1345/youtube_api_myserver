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
        publishedAt: string;
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

    const insertYoutubeQuery = db.prepare(`INSERT INTO youtube_video VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const updateYoutubeQuery = db.prepare(`UPDATE youtube_video SET publishedAt = ? , title = ?, channelTitle = ?, description = ?, thumbnail = ?, liveBroadcast = ?, liveScheduledStartTime = ?, liveActualStartTime = ?, liveActualEndTime = ? WHERE videoId = ?`);
    const removeYoutubeQuery = db.prepare(`DELETE FROM youtube_video WHERE videoId = ?`);

    const checkLiveFlagVideoQuery = db.prepare('SELECT liveBroadcast FROM youtube_video WHERE videoId = ?');

    for (const item of data) {

        const checkLiveFlagVideo = checkLiveFlagVideoQuery.get(item.videoId);
        // ビデオが登録済みで、かつ「ライブではない」or「配信済み」ならば何もしない
        if (checkLiveFlagVideo !== undefined && checkLiveFlagVideo["liveBroadcast"] !== undefined && checkLiveFlagVideo["liveBroadcast"] === "none") {
            continue;
        }

        // 404エラーなどが出てきたら、削除する
        if (item.mode === "remove") {
            console.log("remove! : ", item.videoId);
            removeYoutubeQuery.run(item.videoId);
            continue;
        }

        // 未登録ならば、登録する
        if (checkLiveFlagVideo === undefined) {
            console.log("new! : ", item.title);
            insertYoutubeQuery.run(
                item.videoId,
                name,
                item.publishedAt,
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
        console.log("update! : ", item.title);
        updateYoutubeQuery.run(
            item.publishedAt,
            item.title, item.channelTitle, item.description, item.thumbnail,
            item.liveBroadcast, item.liveScheduledStartTime, item.liveActualStartTime, item.liveActualEndTime,
            item.videoId);
    }
    db.close();
}

export type video = {
    videoId: string,
    publishedAt: string,
    channelTitle: string,
    title: string,
    description: string,
    thumbnail: string,
    liveBroadcast: string,
    liveScheduledStartTime: string,
    liveActualStartTime: string,
    liveActualEndTime: string
}

export function getYoutube(type: string, name: string): video[] {
    const db = Sqlite('.data/vgeek.db');

    if (type === "all") {
        const selectVideoQuery = db.prepare('SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE name = ? ORDER BY publishedAt DESC LIMIT 50');
        const result = selectVideoQuery.all(name);
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    }
    if (type === "video") {
        const selectVideoQuery = db.prepare("SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE name = ? and liveBroadcast = 'none' and liveScheduledStartTime = '' and liveActualStartTime = '' and liveActualEndTime = '' ORDER BY publishedAt DESC LIMIT 50");
        const result = selectVideoQuery.all(name);
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    }
    if (type === "liveNow") {
        const selectVideoQuery = db.prepare("SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE name = ? and liveBroadcast = 'live' ORDER BY publishedAt DESC LIMIT 50");
        const result = selectVideoQuery.all(name);
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    }
    if (type === "liveBefore") {
        const selectVideoQuery = db.prepare("SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE name = ? and liveBroadcast = 'upcoming' ORDER BY publishedAt DESC LIMIT 50");
        const result = selectVideoQuery.all(name);
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    } if (type === "liveAfter") {
        const selectVideoQuery = db.prepare("SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE name = ? and liveBroadcast = 'none' and liveScheduledStartTime != '' and liveActualStartTime != '' and liveActualEndTime != '' ORDER BY publishedAt DESC LIMIT 50");
        const result = selectVideoQuery.all(name);
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    }
}

export function getAllYoutube(type: string): video[] {
    const db = Sqlite('.data/vgeek.db');
    if (type === "all") {
        console.log(type)
        const selectVideoQuery = db.prepare('SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video ORDER BY publishedAt DESC LIMIT 50');
        const result = selectVideoQuery.all();
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    }
    if (type === "video") {
        const selectVideoQuery = db.prepare("SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE liveBroadcast = 'none' and liveScheduledStartTime = '' and liveActualStartTime = '' and liveActualEndTime = '' ORDER BY publishedAt DESC LIMIT 50");
        const result = selectVideoQuery.all();
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    }
    if (type === "liveNow") {
        const selectVideoQuery = db.prepare("SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE liveBroadcast = 'live' ORDER BY publishedAt DESC LIMIT 50");
        const result = selectVideoQuery.all();
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    }
    if (type === "liveBefore") {
        const selectVideoQuery = db.prepare("SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE liveBroadcast = 'upcoming' ORDER BY publishedAt DESC LIMIT 50");
        const result = selectVideoQuery.all();
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    } if (type === "liveAfter") {
        const selectVideoQuery = db.prepare("SELECT videoId, publishedAt, channelTitle, title, description, thumbnail, liveBroadcast, liveScheduledStartTime, liveActualStartTime, liveActualEndTime FROM youtube_video WHERE liveBroadcast = 'none' and liveScheduledStartTime != '' and liveActualStartTime != '' and liveActualEndTime != '' ORDER BY publishedAt DESC LIMIT 50");
        const result = selectVideoQuery.all();
        if (result === undefined) {
            return [];
        }
        return JSON.parse(JSON.stringify(result)) as video[];
    }
    return [];
}