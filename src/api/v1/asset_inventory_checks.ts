import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

interface InventoryChecks {
    uid?: string;
    fk_asset_types?: string;
    fk_inventory_checks?: string;
    question: string;
    answerType: string;
    isMandatory: boolean;
    hint: string;
}

export default defineEventHandler((event) => {
    console.log("Asset Inventory Checks Request incoming");
    const postgrestProxy = new PostgrestProxy(event, "asset_inventory_checks"); 
    
    if (event.method === "GET") {
        return fetchInventoryChecks(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
});

async function fetchInventoryChecks(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<InventoryChecks[]>(`asset_inventory_checks_view`, { method: "GET" });
}