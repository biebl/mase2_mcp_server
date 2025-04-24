import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

interface ServiceOffering {
    uid: string;
    service_type: string;
    title: string;
    sla: string;
    sb_list: string;
    sb_short_list: string;
    sc_version: string;
    created_at: EpochTimeStamp;
    created_by: string;
    modified_at?: EpochTimeStamp;
    modified_by?: string;
}

export default defineEventHandler((event) => {
    const postgrestProxy = new PostgrestProxy(event, "service_offering"); 
    
    if (event.method === "GET") {
        return fetchServiceOfferingView(postgrestProxy);
    }

    if (event.method == "PUT" || event.method == "PATCH") {
        return updateServiceOffering(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
});

async function fetchServiceOfferingView(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<ServiceOffering[]>(`service_offering_view`, { method: "GET" });
}

async function updateServiceOffering(postgrestProxy: PostgrestProxy) {
    const updateBody = await createUpdateBody(postgrestProxy);

    const result = await postgrestProxy.sendCustomRequest("service_offering", {
        method: postgrestProxy.getEventMethod(),
        body: updateBody,
        query: postgrestProxy.getEventRequestQuery()
    });

    const eventHeaders = postgrestProxy.getEventHeaders();

    const returnRepresentation = eventHeaders["prefer"] && eventHeaders["prefer"] === "return=representation";

    if (!returnRepresentation) {
        return result;
    }

    return postgrestProxy.sendCustomRequest("service_offering_view", {
        method: "GET",
        query: postgrestProxy.getEventRequestQuery()
    });
}

async function createUpdateBody(postgrestProxy: PostgrestProxy): Promise<ServiceOffering> {
    const serviceOfferingBody = await postgrestProxy.extractRequestBody() as ServiceOffering | undefined;
    if (!serviceOfferingBody) {
        return Promise.reject("No HTTP Body was included in the request");
    }
    const updateBody: ServiceOffering = { ...serviceOfferingBody };

    return Promise.resolve(updateBody);
}