# Model Control Protocol Server

This project implements a Model Control Protocol Server that encapsulates a REST API for managing various resources related to service offerings, assets, onboarding tasks, and more. The server is built using Node.js and TypeScript, providing a robust and scalable solution for handling service-related data.

## Project Structure

```
model-control-protocol-server
├── src
│   ├── api
│   │   ├── v1
│   │   │   ├── asset_base_attributes.ts
│   │   │   ├── asset_inventory_checks.ts
│   │   │   ├── asset_onboarding_tasks.ts
│   │   │   ├── asset_service_types_relation.ts
│   │   │   ├── assets.ts
│   │   │   ├── brick_config_combi.ts
│   │   │   ├── brick_config_combi_profile.ts
│   │   │   ├── mase_onboardings.ts
│   │   │   ├── service_brick.ts
│   │   │   ├── service_offering.ts
│   │   │   ├── service_type.ts
│   │   │   └── services.ts
│   ├── utils
│   │   └── postgrest-proxy.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Features

- **Asset Management**: Manage assets with detailed attributes and relationships.
- **Service Offerings**: Create, read, update, and delete service offerings.
- **Onboarding Tasks**: Handle onboarding tasks with associated metadata.
- **Service Types**: Define and manage different service types.
- **Brick Configurations**: Manage configurations related to brick combinations.

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd model-control-protocol-server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the server**:
   ```bash
   npm start
   ```

4. **Access the API**: The server will be running on `http://localhost:3000` (or the port specified in your configuration).

## API Documentation

Refer to the individual files in the `src/api/v1` directory for detailed information on the endpoints, request formats, and response structures.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
