import Sqlite, { Database } from "better-sqlite3";
import { google, youtube_v3 } from "googleapis";
import { members as ConfigMembers } from "../../setup/profile.json";

export default defineTask({
    meta: {
        name: "db:migrate",
        description: "Run migrate task",
    },
    async run({ payload, context }) {
        await runDb();
        return { result: "Success" };
    },
});

function getInitFlag(db: Database): boolean {
    const tableQuery = db.prepare(`select count(*) from sqlite_master where type='table' and name=?`);
    const membersTable = tableQuery.get("members")["count(*)"] as Number;
    const youtubeVideoTable = tableQuery.get("youtube_video")["count(*)"] as Number;

    if (membersTable === 0 || youtubeVideoTable === 0) {
        return true;
    }
    return false;
}

function dropDb(db: Database) {
    db.prepare("DROP TABLE IF EXISTS members").run();
    db.prepare("DROP TABLE IF EXISTS youtube_video").run();
}

function createDb(db: Database) {
    db.prepare(`CREATE TABLE IF NOT EXISTS members ('name' TEXT PRIMARY KEY, 'display_name' TEXT, 'youtube_handle' TEXT, 'youtube_playlist' JSON, 'youtube_channel_id' JSON)`).run();
    db.prepare(`CREATE TABLE IF NOT EXISTS youtube_video ('videoId' TEXT PRIMARY KEY, 'name' TEXT NOT NULL, 'publishedAt' TEXT, 'title' TEXT, 'channelTitle' TEXT, 'description' TEXT, 'thumbnail' TEXT, 'liveBroadcast' TEXT, 'liveScheduledStartTime' TEXT, 'liveActualStartTime' TEXT, 'liveActualEndTime' TEXT)`).run();
}

async function getYoutubeChannel(service: youtube_v3.Youtube, handle: string): Promise<{ playlists: string[], ids: string[] }> {
    console.log("getYoutubeChannel : ", handle, " => start!");

    const channels_result = await service.channels.list({
        key: useRuntimeConfig().youtubeKey,
        part: ["contentDetails"],
        forHandle: handle
    });
    const member_playlists: string[] = channels_result.data.items.flatMap(e => e.contentDetails.relatedPlaylists.uploads ?? []);
    const member_ids: string[] = channels_result.data.items.flatMap(e => e.id ?? []);
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("getYoutubeChannel : ", handle, " => end!");
    return { playlists: member_playlists, ids: member_ids };
}

// メンバーコンフィグ(setup/profile.json)とDBの設定が合っているかを、確認する。
async function checkMemberDB(db: Database): Promise<{
    name: string,
    newMember: boolean,
    youtube: {
        handle: string, playlists: string[], ids: string[]
    }
}[]> {
    const selectYoutubeHandleQuery = db.prepare('SELECT youtube_handle FROM members WHERE name = ?');
    const googleService = google.youtube('v3');

    const diffItems: {
        name: string,
        newMember: boolean,
        youtube: {
            handle: string, playlists: string[], ids: string[]
        }
    }[] = [];
    for (const member of ConfigMembers) {
        const DbHandle = await selectYoutubeHandleQuery.get(member.name);
        if (DbHandle !== undefined && DbHandle.hasOwnProperty["youtube_handle"] !== false && DbHandle["youtube_handle"] === member.youtubeHandle) {
            console.log("diff not change : ", DbHandle["youtube_handle"])
            continue;
        }
        const newMember = DbHandle ? false : true;

        const { playlists, ids } = await getYoutubeChannel(googleService, member.youtubeHandle);
        const youtube = { handle: member.youtubeHandle, playlists, ids };
        diffItems.push({
            name: member.name,
            youtube,
            newMember,
        });
    }
    return diffItems;
}

function createMember(db: Database, addMembers: {
    name: string,
    newMember: boolean,
    youtube: {
        handle: string, playlists: string[], ids: string[]
    }
}[]) {
    if (addMembers === undefined) return;

    const insertMemberQuery = db.prepare(`INSERT INTO members VALUES (?, ?, ?, ?, ?)`);
    const updateMemberQuery = db.prepare(`UPDATE members SET youtube_handle = ?, youtube_playlist = ?, youtube_channel_id = ? WHERE name = ?`);

    for (const member of addMembers) {
        const cMember = ConfigMembers.find(e => e.name === member.name)
        if (cMember === undefined) continue;

        // 新規メンバーならば
        if (member.newMember) {
            insertMemberQuery.run(cMember.name, cMember.displayName, member.youtube.handle, JSON.stringify(member.youtube.playlists), JSON.stringify(member.youtube.ids));
            continue;
        }

        // 更新メンバーならば
        updateMemberQuery.run(member.youtube.handle, JSON.stringify(member.youtube.playlists), JSON.stringify(member.youtube.ids), cMember.name);
    }
}

async function runDb() {
    console.log("Running migrate task...");

    const db = Sqlite('.data/vgeek.db');

    const init = getInitFlag(db);

    // @see : https://nitro.unjs.io/guide/database
    // データベースセットアップ
    if (init) {
        console.log(" ---> Init Start!");
        dropDb(db);
        createDb(db);
    }

    console.log(" ---> Start : DB Cheack!");
    const diff = await checkMemberDB(db);
    createMember(db, diff);
    console.log(" ---> End : DB Cheack!");

    db.close();

    if (init) {
        await runTask('youtube:search');
        await runTask('youtube:video');

        console.log(" <---Init End!");
    }
}