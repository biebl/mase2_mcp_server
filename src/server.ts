import express from 'express';
import { PostgrestProxy } from './utils/postgrest-proxy';
import assetBaseAttributes from './api/v1/asset_base_attributes';
import assetInventoryChecks from './api/v1/asset_inventory_checks';
import assetOnboardingTasks from './api/v1/asset_onboarding_tasks';
import assetServiceTypesRelation from './api/v1/asset_service_types_relation';
import assets from './api/v1/assets';
import brickConfigCombi from './api/v1/brick_config_combi';
import brickConfigCombiProfile from './api/v1/brick_config_combi_profile';
import maseOnboardings from './api/v1/mase_onboardings';
import serviceBrick from './api/v1/service_brick';
import serviceOffering from './api/v1/service_offering';
import serviceType from './api/v1/service_type';
import services from './api/v1/services';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/v1/asset_base_attributes', assetBaseAttributes);
app.use('/api/v1/asset_inventory_checks', assetInventoryChecks);
app.use('/api/v1/asset_onboarding_tasks', assetOnboardingTasks);
app.use('/api/v1/asset_service_types_relation', assetServiceTypesRelation);
app.use('/api/v1/assets', assets);
app.use('/api/v1/brick_config_combi', brickConfigCombi);
app.use('/api/v1/brick_config_combi_profile', brickConfigCombiProfile);
app.use('/api/v1/mase_onboardings', maseOnboardings);
app.use('/api/v1/service_brick', serviceBrick);
app.use('/api/v1/service_offering', serviceOffering);
app.use('/api/v1/service_type', serviceType);
app.use('/api/v1/services', services);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});