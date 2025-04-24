// filepath: model-control-protocol-server/model-control-protocol-server/src/api/v1/service_brick.ts
import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

interface ServiceBrick {
    uid: string;
    title: string;
    state?: string;
    maintenance_class: string;
    version: number;
    sd_activities?: string;
    sd_service_delimination?: string;
    sd_cooperation_duties?: string;
    sd_preconditions?: string;
    created_at: EpochTimeStamp;
    created_by: string;
    modified_at?: EpochTimeStamp;
    modified_by?: string;
}

export default defineEventHandler((event) => {
    const postgrestProxy = new PostgrestProxy(event, "service_brick"); 
    
    if(event.method === "GET") {
        return fetchServiceBrickView(postgrestProxy);
    }

    if(event.method == "PUT" || event.method == "PATCH") {
        return handleServiceBrickUpdate(postgrestProxy);
    }
    if(event.method == "POST") {
        return handleServiceBrickInsert(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
})

async function fetchServiceBrickView(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<ServiceBrick[]>(`service_brick_view`, { method: "GET" });
}

async function handleServiceBrickInsert(postgrestProxy: PostgrestProxy) {
    try {    
        const extractedBody = await postgrestProxy.extractRequestBody();
        return postgrestProxy.sendCustomRequest("rpc/create_service_brick", {
            method: "POST",
            body: { sb: extractedBody },
            customSchema: "servicecatalog"
        });
    } catch (error) {
        return Promise.reject(error);
    }
}

async function handleServiceBrickUpdate(postgrestProxy: PostgrestProxy) {
    try {
        const extractedBody = await postgrestProxy.extractRequestBody();
        await postgrestProxy.sendCustomRequest("rpc/update_service_brick", {
            method: "POST",
            body: { sb: extractedBody, service_brick_id: extractServiceBrickId(postgrestProxy) },
            customSchema: "servicecatalog",
            headers: { "prefer": "return=representation" }
        });
        
        const [serviceBrick]: Record<string, any>[] = await postgrestProxy.sendCustomRequest("service_brick", {
            method: "GET",
            headers: postgrestProxy.getEventRequestQuery()
        });

        return postgrestProxy.sendCustomRequest("service_brick_view", {
            method: "GET",
            query: {
                "series_id": `eq.${serviceBrick.series_id}`,
                "is_newest": "eq.true"
            }
        });
    } catch (error) {
        return Promise.reject(error);
    }
}

function extractServiceBrickId(postgrestProxy: PostgrestProxy) {
    const query = postgrestProxy.getEventRequestQuery() as Record<string, string>;

    for (const [key, value] of Object.entries(query)) {
        if (key == "uid" && value.startsWith("eq.")) {
            return value.replace("eq.", "");
        }
    }
    throw new Error("This request only supports filtering using uid, please provide uid=eq.<uid> parameter");
}