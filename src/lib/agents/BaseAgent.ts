import { AgentMessage, AgentResponse, AgentContext, AgentRole, AgentTool } from './types';

export abstract class BaseAgent {
    public abstract readonly role: AgentRole;
    protected history: AgentMessage[] = [];
    protected systemPrompt: string = '';
    protected tools: Record<string, AgentTool> = {};

    constructor(systemPrompt?: string) {
        if (systemPrompt) {
            this.systemPrompt = systemPrompt;
        }
    }

    protected async callLLM(messages: AgentMessage[], temperature: number = 0.7, useTools: boolean = true): Promise<string> {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        const apiUrl = 'https://api.deepseek.com/v1/chat/completions';

        if (!apiKey) {
            throw new Error('DEEPSEEK_API_KEY is not configured');
        }

        const formatMessages = (msgs: AgentMessage[]) => {
            return msgs.map(msg => {
                const formatted: any = {
                    role: msg.role,
                    content: msg.content || null
                };

                if (msg.role === 'assistant' && msg.metadata?.tool_calls) {
                    formatted.tool_calls = msg.metadata.tool_calls;
                }

                if (msg.role === 'tool') {
                    formatted.tool_call_id = msg.tool_call_id;
                    formatted.name = msg.name;
                }

                return formatted;
            });
        };

        const formattedMessages = formatMessages(messages);

        const body: any = {
            model: 'deepseek-chat',
            messages: formattedMessages,
            temperature,
        };

        if (useTools && Object.keys(this.tools).length > 0) {
            body.tools = Object.values(this.tools).map(t => ({
                type: 'function',
                function: t.definition
            }));
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(`LLM API error: ${error.error?.message || error.message || response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0]?.message;

        if (assistantMessage.tool_calls && useTools) {
            // Add the assistant's tool call to history
            this.history.push({
                role: 'assistant',
                content: assistantMessage.content || '',
                timestamp: Date.now(),
                metadata: { tool_calls: assistantMessage.tool_calls }
            });

            // Prepare tool results for the second call
            const toolResults: AgentMessage[] = [];

            for (const toolCall of assistantMessage.tool_calls) {
                const tool = this.tools[toolCall.function.name];
                if (tool) {
                    try {
                        const args = JSON.parse(toolCall.function.arguments);
                        const result = await tool.execute(args);

                        const toolMsg: AgentMessage = {
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            name: toolCall.function.name,
                            content: JSON.stringify(result),
                            timestamp: Date.now()
                        };

                        toolResults.push(toolMsg);
                        this.history.push(toolMsg);
                    } catch (e) {
                        const errorMsg: AgentMessage = {
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            name: toolCall.function.name,
                            content: JSON.stringify({ error: `Tool execution failed: ${e}` }),
                            timestamp: Date.now()
                        };
                        toolResults.push(errorMsg);
                        this.history.push(errorMsg);
                    }
                }
            }

            // Call LLM again with tool results
            // We use the same message history but including the new tool results
            return this.callLLM([...messages, {
                role: 'assistant',
                content: assistantMessage.content || '',
                timestamp: Date.now(),
                metadata: { tool_calls: assistantMessage.tool_calls }
            }, ...toolResults], temperature, false);
        }

        const content = assistantMessage?.content || '';
        this.history.push({ role: 'assistant', content, timestamp: Date.now() });
        return content;
    }

    public abstract processMessage(message: string, context: AgentContext): Promise<AgentResponse>;

    protected addToHistory(message: AgentMessage) {
        this.history.push(message);
        // Keep history manageable
        if (this.history.length > 20) {
            this.history = this.history.slice(-20);
        }
    }

    public getHistory(): AgentMessage[] {
        return this.history;
    }

    public clearHistory() {
        this.history = [];
    }
}
