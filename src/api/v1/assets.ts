// filepath: model-control-protocol-server/model-control-protocol-server/src/api/v1/assets.ts
import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

interface Asset {
    uid?: string;
    fk_services?: string;
    fk_asset_types?: string;
    name: string;
    properties: Object;
    description: string;
    completenessInventory?: number;
    completenessOnboarding?: number;
    todoInventory?: number;
}

export default defineEventHandler((event) => {
    console.log("Assets Request incoming");
    const postgrestProxy = new PostgrestProxy(event, "assets"); 
    
    if (event.method === "GET") {
        return fetchAssetsJoinedWithPercentage(postgrestProxy);
    }

    if (event.method === "PUT" || event.method === "PATCH") {
        return updateAsset(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
});

async function fetchAssetsJoinedWithPercentage(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<Asset[]>(`assets_view`, { method: "GET" });
}

async function updateAsset(postgrestProxy: PostgrestProxy) {
    const updateBody = await createUpdateBody(postgrestProxy);

    const result = await postgrestProxy.sendCustomRequest("assets", {
        method: postgrestProxy.getEventMethod(),
        body: updateBody,
        query: postgrestProxy.getEventRequestQuery()
    });

    const eventHeaders = postgrestProxy.getEventHeaders();

    const returnRepresentation = eventHeaders["prefer"] && eventHeaders["prefer"] === "return=representation";

    if (!returnRepresentation) {
        return result;
    }

    return postgrestProxy.sendCustomRequest("assets_view", {
        method: "GET",
        query: postgrestProxy.getEventRequestQuery()
    });
}

async function createUpdateBody(postgrestProxy: PostgrestProxy): Promise<Asset> {
    const assetBody = await postgrestProxy.extractRequestBody() as Asset | undefined;
    if (!assetBody) {
        return Promise.reject("No HTTP Body was included in the request");
    }
    const updateBody: Asset = { ...assetBody };

    delete updateBody.completenessInventory;
    delete updateBody.completenessOnboarding;
    delete updateBody.todoInventory;

    return Promise.resolve(updateBody);
}