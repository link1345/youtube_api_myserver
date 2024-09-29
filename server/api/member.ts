import { getMembers } from "~/util";

/** 全てのユーザを取得する */
export default eventHandler(() => ({
    members: getMembers().map(e => ({ ...e, url: `https://www.youtube.com/@${e.name}` })),
}));