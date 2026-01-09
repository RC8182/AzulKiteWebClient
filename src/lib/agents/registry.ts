import { ProductAgent } from './ProductAgent';
import { AgentRole, IAgent } from './types';

class AgentRegistry {
    private static instance: AgentRegistry;
    private agents: Map<string, any> = new Map();

    private constructor() { }

    public static getInstance(): AgentRegistry {
        if (!AgentRegistry.instance) {
            AgentRegistry.instance = new AgentRegistry();
        }
        return AgentRegistry.instance;
    }

    public getAgent(role: AgentRole, sessionId: string): any {
        const key = `${role}_${sessionId}`;
        if (!this.agents.has(key)) {
            switch (role) {
                case 'product_agent':
                    this.agents.set(key, new ProductAgent());
                    break;
                // Add more agents here
                default:
                    this.agents.set(key, new ProductAgent());
            }
        }
        return this.agents.get(key);
    }

    public clearSession(sessionId: string) {
        for (const key of this.agents.keys()) {
            if (key.endsWith(`_${sessionId}`)) {
                this.agents.delete(key);
            }
        }
    }
}

export const agentRegistry = AgentRegistry.getInstance();
