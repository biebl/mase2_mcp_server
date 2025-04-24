interface ServiceType {
    uid?: string;
    name: string;
    chapter: number;
    sub_chapter: number;
    rs2_service_type_id: number;
    version: number;
    introduction: string;
    service_description: string;
    fk_brick_config_combi_profile: string;
    created_at: EpochTimeStamp;
    created_by: string;
    modified_at?: EpochTimeStamp;
    modified_by?: string;
    category: string;
    series_id: string;
    is_archived: boolean;
    display: boolean;
}

export default defineEventHandler((event) => {
    const postgrestProxy = new PostgrestProxy(event, "service_type");

    if (event.method === "GET") {
        return fetchServiceTypeView(postgrestProxy);
    } else if (event.method === "PATCH") {
        return handleServiceTypeUpdate(postgrestProxy);
    } else if (event.method === "POST") {
        return handleServiceTypeInsert(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
});

async function fetchServiceTypeView(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<ServiceType[]>(`service_type_view`, { method: "GET" });
}

async function handleServiceTypeInsert(postgrestProxy: PostgrestProxy) {
    try {
        const extractedBody = await postgrestProxy.extractRequestBody();
        return postgrestProxy.sendCustomRequest("rpc/create_service_type", {
            method: "POST",
            body: { st: extractedBody },
            customSchema: "servicecatalog"
        });
    } catch (error) {
        return Promise.reject(error);
    }
}

async function handleServiceTypeUpdate(postgrestProxy: PostgrestProxy) {
    const extractedBody = await postgrestProxy.extractRequestBody();

    try {
        const res = await postgrestProxy.sendCustomRequest("rpc/update_service_type", {
            method: "POST",
            body: { st: extractedBody, service_type_id: extractServiceTypeId(postgrestProxy) },
            customSchema: "servicecatalog"
        });
        return Promise.resolve(res);
    } catch (error) {
        console.log("extractedBody no json", extractedBody);
        return Promise.reject(error);
    }
}

function extractServiceTypeId(postgrestProxy: PostgrestProxy) {
    const query = postgrestProxy.getEventRequestQuery() as Record<string, string>;

    for (const [key, value] of Object.entries(query)) {
        if (key === "uid" && value.startsWith("eq.")) {
            return value.replace("eq.", "");
        }
    }
    throw new Error("This request only supports filtering using uid, please provide uid=eq.<uid> parameter");
}