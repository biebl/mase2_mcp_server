interface BrickConfigCombi {
    uid: string;
    brick_config_combinations: string[];
    created_at: EpochTimeStamp;
    created_by: string;
    modified_at?: EpochTimeStamp;
    modified_by?: string;
    fk_brick_config_combi_profile: string;
}

export default defineEventHandler(async (event) => {
    const postgrestProxy = new PostgrestProxy(event, "brick_config_combi"); 

    if(event.method === "GET") {
        return fetchBrickConfigCombiView(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
})

async function fetchBrickConfigCombiView(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<BrickConfigCombi[]>(`brick_config_combi_view`, { method: "GET" });
}