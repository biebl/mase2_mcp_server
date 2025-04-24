import { PostgrestProxy } from "~~/server/utils/postgrest-proxy";

interface OnboardingTasks {
    uid?: string;
    fk_asset_types?: string;
    fk_onboarding_tasks?: string;
    task: string;
    hint: string;
    responsibleRole: string;
    sortIndex: number;
    isMandatory: boolean;
    fk_services?: string;
}

export default defineEventHandler((event) => {
    console.log("Asset Onboarding Tasks Request incoming")
    const postgrestProxy = new PostgrestProxy(event,"asset_onboarding_tasks"); 
    
    if(event.method === "GET") {
        return fetchOnboardingTasks(postgrestProxy);
    }

    return postgrestProxy.forwardEventHandlerRequest();
})

async function fetchOnboardingTasks(postgrestProxy:PostgrestProxy) {
    return postgrestProxy.sendCustomRequest<OnboardingTasks[]>(`asset_onboarding_tasks_view`,{method:"GET"})
}