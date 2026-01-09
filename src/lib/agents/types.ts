export type AgentRole = 'product_agent' | 'customer_support' | 'billing_admin' | 'general';

export interface AgentMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    timestamp: number;
    metadata?: any;
    tool_call_id?: string;
    name?: string;
}

export interface AgentContext {
    userId?: string;
    language: 'es' | 'en' | 'it';
    currentProductId?: string;
    sessionData?: Record<string, any>;
    files?: File[];
}

export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: 'object';
        properties: Record<string, any>;
        required?: string[];
    };
}

export interface AgentTool {
    definition: ToolDefinition;
    execute: (args: any) => Promise<any>;
}

export interface AgentResponse {
    content: string;
    suggestedActions?: Array<{
        label: string;
        action: string;
        payload?: any;
    }>;
    status: 'complete' | 'requires_info' | 'error';
    missingFields?: string[];
}

export interface IAgent {
    id: string;
    role: AgentRole;
    processMessage: (message: string, context: AgentContext) => Promise<AgentResponse>;
}
