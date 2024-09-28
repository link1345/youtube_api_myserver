import { getYoutube } from "~/util"

export default defineEventHandler(event => {
    const name = getRouterParam(event, 'name');
    return getYoutube(name);
})