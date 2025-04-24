// filepath: /model-control-protocol-server/model-control-protocol-server/src/api/v1/services.ts
import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

interface Service {
  uid?: string;
  articleName: string;
  articleNumber: string;
  fk_mase_onboarding?: string;
  serviceAssets: ServiceAsset[];
  serviceParameter: Object;
  sla: string;
  fk_service_types: string;
  serviceType?: ServiceType;
}

interface ServiceType {
  uid?: string;
  name: string;
  meta?: any;
  created_at?: Date | string;
  created_by?: string;
  modified_at?: Date | string;
  modified_by?: string;
}

interface ServiceAsset {
  expectedCount: number;
  actualCount?: number;
  assetName?: string;
  fk_asset_types: string;
}

export default defineEventHandler((event) => {
  const postgrestProxy = new PostgrestProxy(event, "services");

  if (event.method === "GET") {
    return fetchServices(postgrestProxy);
  }

  if (event.method === "POST") {
    return insertService(postgrestProxy);
  }

  if (event.method === "PUT" || event.method === "PATCH") {
    return updateService(postgrestProxy);
  }

  return postgrestProxy.forwardEventHandlerRequest();
});

async function fetchServices(postgrestProxy: PostgrestProxy) {
  return postgrestProxy.sendCustomRequest<Service[]>(`services_view`, { method: "GET" });
}

async function insertService(postgrestProxy: PostgrestProxy) {
  const serviceBody = await postgrestProxy.extractRequestBody() as Service | undefined;

  if (!serviceBody) {
    return Promise.reject("No HTTP Body was included in the request");
  }

  if (!serviceBody.serviceType) {
    return Promise.reject("No Service Type was provided");
  }

  const serviceName = serviceBody.serviceType.name;
  const serviceType: ServiceType = await provideServiceType(postgrestProxy, serviceName);
  const serviceAssets = await provideServiceAssets(postgrestProxy, serviceBody.serviceAssets, serviceType.uid as string);

  const service: Service = {
    articleName: serviceBody.articleName,
    articleNumber: serviceBody.articleNumber,
    fk_mase_onboarding: serviceBody.fk_mase_onboarding,
    serviceAssets,
    serviceParameter: serviceBody.serviceParameter,
    sla: serviceBody.sla,
    fk_service_types: serviceType.uid as string,
  };

  const insertedServiceResult = await postgrestProxy.sendCustomRequest<Service[]>("services", {
    method: "POST",
    body: service,
  });

  const insertedService = insertedServiceResult[0] as Service;
  insertedService.serviceType = serviceType;

  insertedService.serviceAssets.forEach(serviceAsset => {
    serviceAsset.actualCount = 0;
  });

  return Promise.resolve(insertedService);
}

async function updateService(postgrestProxy: PostgrestProxy) {
  const updateBody = await createUpdateBody(postgrestProxy);

  const result = await postgrestProxy.sendCustomRequest("services", {
    method: postgrestProxy.getEventMethod(),
    body: updateBody,
    query: postgrestProxy.getEventRequestQuery(),
  });

  const eventHeaders = postgrestProxy.getEventHeaders();
  const returnRepresentation = eventHeaders["prefer"] && eventHeaders["prefer"] === "return=representation";

  if (!returnRepresentation) {
    return result;
  }

  return postgrestProxy.sendCustomRequest("services_view", {
    method: "GET",
    query: postgrestProxy.getEventRequestQuery(),
  });
}

async function createUpdateBody(postgrestProxy: PostgrestProxy): Promise<Service> {
  const serviceBody = await postgrestProxy.extractRequestBody() as Service | undefined;
  if (!serviceBody) {
    return Promise.reject("No HTTP Body was included in the request");
  }
  const updateBody: Service = { ...serviceBody };

  delete updateBody.serviceType;
  delete updateBody.uid;

  const requestQuery = postgrestProxy.getEventRequestQuery();
  const fetchedServices = await postgrestProxy.sendCustomRequest<Service[]>("services_view", {
    method: "GET",
    query: {
      uid: requestQuery.uid,
    },
  });

  if (fetchedServices.length === 0) {
    return Promise.reject("Service to update was not found in database");
  }

  const serviceTypeId = fetchedServices[0].fk_service_types;
  const serviceAssetsBody = updateBody.serviceAssets ?? [];

  updateBody.serviceAssets = await provideServiceAssets(postgrestProxy, serviceAssetsBody, serviceTypeId);

  return Promise.resolve(updateBody);
}

async function provideServiceAssets(postgrestProxy: PostgrestProxy, inputAssets: ServiceAsset[], serviceTypeId: string): Promise<ServiceAsset[]> {
  const result = await Promise.allSettled<ServiceAsset>(inputAssets.map(async asset => {
    const matchingMapping: any[] = await postgrestProxy.sendCustomRequest("asset_service_types_relation", {
      method: "GET",
      query: {
        excel_mappings: `cs.{${asset.assetName}}`,
        fk_service_types: `eq.${serviceTypeId}`,
      },
    });

    if (matchingMapping.length === 0) {
      const [insertedAssetType] = await postgrestProxy.sendCustomRequest<AssetType[]>("asset_types", {
        method: "POST",
        body: {
          name: asset.assetName,
        },
      });

      await postgrestProxy.sendCustomRequest("asset_service_types_relation", {
        method: "POST",
        body: {
          fk_asset_types: insertedAssetType.uid,
          fk_service_types: serviceTypeId,
          excel_mappings: [asset.assetName],
        },
      });

      return Promise.resolve({
        fk_asset_types: insertedAssetType.uid,
        expectedCount: asset.expectedCount,
      });
    } else {
      const [assetTypeResult] = await postgrestProxy.sendCustomRequest("asset_types", {
        method: "GET",
        query: {
          uid: `eq.${matchingMapping[0].fk_asset_types}`,
        },
      }) as AssetType[];

      return Promise.resolve({
        fk_asset_types: assetTypeResult.uid,
        expectedCount: asset.expectedCount,
      });
    }
  }));

  const failedProms = result.filter(prom => prom.status === "rejected");
  if (failedProms.length > 0) {
    return Promise.reject(failedProms);
  }

  let serviceAssets = result.map(res => {
    return res.status === "fulfilled" ? res.value : null;
  }) as ServiceAsset[];

  const remainingAssetsQuery: Record<string, any> = {
    fk_service_types: `eq.${serviceTypeId}`,
  };

  if (serviceAssets.length > 0) {
    remainingAssetsQuery.and = "(" + serviceAssets.map((asset: any) => `fk_asset_types.neq.${asset.fk_asset_types}`).join(",") + ")";
  }

  const remainingAssetRelations = await postgrestProxy.sendCustomRequest("asset_service_types_relation", {
    method: "GET",
    query: remainingAssetsQuery,
  }) as any[];

  serviceAssets = serviceAssets.concat(remainingAssetRelations.map((assetRelation: any) => {
    if (assetRelation.fk_asset_types == null) {
      console.log("assetRelation null value", assetRelation);
    }
    return { expectedCount: 1, fk_asset_types: assetRelation.fk_asset_types };
  }));

  return Promise.resolve(serviceAssets);
}

async function provideServiceType(postgrestProxy: PostgrestProxy, serviceName: string): Promise<ServiceType> {
  try {
    const foundServiceTypes = await postgrestProxy.sendCustomRequest<ServiceType[]>("onboarding_service_types_view", {
      method: "GET",
      query: {
        name: `eq.${serviceName}`,
      },
    });

    if (foundServiceTypes.length === 0) {
      return Promise.reject("Service Type not found");
    }
    return Promise.resolve(foundServiceTypes[0]);
  } catch (error: any) {
    if (error?.response) {
      return Promise.reject(error.response);
    }
    return Promise.reject(error);
  }
}