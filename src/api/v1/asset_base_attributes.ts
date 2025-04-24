import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

interface BaseAttributes {
    uid?: string;
    fk_asset_types?: string;
    fk_base_attributes?: string;
    fieldType: string;
    fieldName: string;
    isMandatory: boolean;
}

export default defineEventHandler((event) => {
    console.log("Asset Base Attributes Request incoming");
    const postgrestProxy = new PostgrestProxy(event, "asset_base_attributes"); 
    
    if(event.method === "GET") {
        return fetchBaseAttributes(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
})

async function fetchBaseAttributes(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<BaseAttributes[]>(`asset_base_attributes_view`, { method: "GET" });
}