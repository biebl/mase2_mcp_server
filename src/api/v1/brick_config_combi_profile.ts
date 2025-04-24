import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

export default defineEventHandler((event) => {
    const postgrestProxy = new PostgrestProxy(event, "brick_config_combi_profile"); 
    
    if(event.method === "GET") {
        return fetchProfilesView(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
})

async function fetchProfilesView(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest(`brick_config_combi_profile_view`, { method: "GET", query: postgrestProxy.getEventRequestQuery() });
}