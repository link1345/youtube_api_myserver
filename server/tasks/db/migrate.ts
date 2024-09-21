import Sqlite, { Database } from "better-sqlite3";

const initMode = true;

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

function dropDb(db: Database) {
    db.prepare("DROP TABLE IF EXISTS members").run();
}

function createDb(db: Database) {

    db.prepare(`CREATE TABLE IF NOT EXISTS members ('id' TEXT PRIMARY KEY, 'name' TEXT, 'youtube_url' TEXT, 'youtube_id' TEXT, 'twitch_url' TEXT, 'twitch_id' TEXT)`).run();
}

function addMember(db: Database): { memberId: string } {

    const memberId = String(Math.round(Math.random() * 10_000));
    const insertMemberQuery = db.prepare(`INSERT INTO members VALUES (?, 'John', 'youtube_url', 'youtube_id', 'twitch_url', 'twitch_id')`);
    insertMemberQuery.run(memberId);

    return { memberId };
}

async function runDb() {
    console.log("Running migrate task...");

    const db = Sqlite();

    // @see : https://nitro.unjs.io/guide/database
    // データベースセットアップ
    if (initMode) {
        dropDb(db);
        createDb(db);
    }

    // 初期データ挿入
    const { memberId } = addMember(db);

    // テスト
    const selectMemberQuery = db.prepare('SELECT * FROM members WHERE id = ?');
    console.log(await selectMemberQuery.get(memberId));
}