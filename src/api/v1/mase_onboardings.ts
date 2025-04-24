// filepath: model-control-protocol-server/src/api/v1/mase_onboardings.ts
import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

interface MaseOnboarding {
    uid?: string;
    description: string;
    customerInformation: Record<string, any>;
    contractInformation: Record<string, any>;
    servicecatalogVersion: string;
    agbVersion: string;
    fileStorage: Record<string, any>;
    meta: Record<string, any>;
    version: any;
    state: "managed-service-active" | "onboarding" | "contract-signed" | "inventory";
    completenessInventory?: number;
    completenessOnboarding?: number;
}

export default defineEventHandler((event) => {
    console.log("Mase_onboardings Request incoming");
    const postgrestProxy = new PostgrestProxy(event, "mase_onboardings");

    if (event.method === "GET") {
        return fetchMaseOnboardingsView(postgrestProxy);
    }

    if (event.method == "PUT" || event.method == "PATCH") {
        return updateMaseOnboarding(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
});

async function fetchMaseOnboardingsView(postgrestProxy: PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<MaseOnboarding[]>(`mase_onboardings_view`, { method: "GET" });
}

async function updateMaseOnboarding(postgrestProxy: PostgrestProxy) {
    const updateBody = await createUpdateBody(postgrestProxy);

    const result = await postgrestProxy.sendCustomRequest("mase_onboardings", {
        method: postgrestProxy.getEventMethod(),
        body: updateBody,
        query: postgrestProxy.getEventRequestQuery()
    });

    const eventHeaders = postgrestProxy.getEventHeaders();

    const returnRepresentation = eventHeaders["prefer"] && eventHeaders["prefer"] === "return=representation";

    if (!returnRepresentation) {
        return result;
    }

    return postgrestProxy.sendCustomRequest("mase_onboardings_view", {
        method: "GET",
        query: postgrestProxy.getEventRequestQuery()
    });
}

async function createUpdateBody(postgrestProxy: PostgrestProxy): Promise<MaseOnboarding> {
    const maseOnboardingBody = await postgrestProxy.extractRequestBody() as MaseOnboarding | undefined;
    if (!maseOnboardingBody) {
        return Promise.reject("No HTTP Body was included in the request");
    }
    const updateBody: MaseOnboarding = { ...maseOnboardingBody };

    delete updateBody.completenessInventory;
    delete updateBody.completenessOnboarding;

    return Promise.resolve(updateBody);
}