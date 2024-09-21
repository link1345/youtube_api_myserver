import { memberData } from "../data/member";

/** 全てのユーザを取得する */
export default eventHandler(() => ({
    members: memberData,
}));