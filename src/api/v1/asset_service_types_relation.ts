interface AssetServiceTypesRelation {
    uid?: string;
    fk_asset_types: string;
    fk_service_types: string;
    excel_mappings: string[];
    assetName?: string;
}

export default defineEventHandler((event) => {
    console.log("Asset Service Types Relation Request incoming")
    const postgrestProxy = new PostgrestProxy(event, "asset_service_types_relation"); 
    
    if(event.method === "GET") {
        return fetchAssetServiceTypesRelationView(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
})

async function fetchAssetServiceTypesRelationView(postgrestProxy:PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<AssetServiceTypesRelation[]>(`asset_service_types_relation_view`, { method:"GET" });
}