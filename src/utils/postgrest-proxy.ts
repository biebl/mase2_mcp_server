export class PostgrestProxy {
    private event: any;
    private resource: string;

    constructor(event: any, resource: string) {
        this.event = event;
        this.resource = resource;
    }

    async extractRequestBody(): Promise<any> {
        return this.event.request.body;
    }

    async sendCustomRequest<T>(resource: string, options: { method: string; body?: any; query?: any; headers?: any; customSchema?: string }): Promise<T> {
        const response = await fetch(`${process.env.POSTGREST_URL}/${resource}`, {
            method: options.method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return response.json();
    }

    getEventMethod(): string {
        return this.event.request.method;
    }

    getEventRequestQuery(): Record<string, any> {
        return this.event.request.query;
    }

    getEventHeaders(): Record<string, any> {
        return this.event.request.headers;
    }

    forwardEventHandlerRequest() {
        // Logic to forward the request to the appropriate handler
    }
}