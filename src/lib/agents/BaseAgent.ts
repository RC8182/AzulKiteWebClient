import { AgentMessage, AgentResponse, AgentContext, AgentRole, AgentTool } from './types';

export abstract class BaseAgent {
    public abstract readonly role: AgentRole;
    protected history: AgentMessage[] = [];
    protected systemPrompt: string = '';
    protected tools: Record<string, AgentTool> = {};
    protected activeContext?: AgentContext;


    constructor(systemPrompt?: string) {
        if (systemPrompt) {
            this.systemPrompt = systemPrompt;
        }
    }

    // Truncate large tool results to prevent context overflow
    private truncateToolResult(result: any, maxLength: number = 5000): string {
        const stringified = JSON.stringify(result);
        if (stringified.length <= maxLength) {
            return stringified;
        }

        // If it's an array, show count and sample
        if (Array.isArray(result)) {
            const sample = result.slice(0, 3);
            return JSON.stringify({
                _truncated: true,
                total_items: result.length,
                sample: sample,
                message: `Showing 3 of ${result.length} items. Use filters or pagination for more.`
            });
        }

        // Otherwise just truncate the string
        return stringified.substring(0, maxLength) + '... [TRUNCATED]';
    }

    // Keep only the most recent conversation turns to prevent overflow
    private pruneHistory(messages: AgentMessage[]): AgentMessage[] {
        const MAX_HISTORY_MESSAGES = 50; // Increased to 50 to prevent context loss during complex tool chains
        const systemMessages = messages.filter(m => m.role === 'system');
        const nonSystemMessages = messages.filter(m => m.role !== 'system');

        if (nonSystemMessages.length <= MAX_HISTORY_MESSAGES) {
            return messages;
        }

        // Keep system + last N messages
        let prunedMessages = [...systemMessages, ...nonSystemMessages.slice(-MAX_HISTORY_MESSAGES)];

        // CRITICAL: Ensure no orphaned tool messages
        // Tool messages must always follow an assistant message with tool_calls
        const validatedMessages: AgentMessage[] = [];
        let lastAssistantHadToolCalls = false;

        for (const msg of prunedMessages) {
            if (msg.role === 'assistant') {
                lastAssistantHadToolCalls = !!msg.metadata?.tool_calls;
                validatedMessages.push(msg);
            } else if (msg.role === 'tool') {
                // Only include tool messages if they follow an assistant with tool_calls
                if (lastAssistantHadToolCalls) {
                    validatedMessages.push(msg);
                }
                // If we've processed all tool responses, reset the flag
                // (This is a simple heuristic - in practice, we'd need to track tool_call_ids)
            } else {
                // User or system messages reset the tool call context
                if (msg.role === 'user') {
                    lastAssistantHadToolCalls = false;
                }
                validatedMessages.push(msg);
            }
        }

        return validatedMessages;
    }

    protected async callLLM(messages: AgentMessage[], temperature: number = 0.7, useTools: boolean = true): Promise<string> {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
        const MAX_ITERATIONS = 15;
        let iteration = 0;
        let currentMessages = [...messages];

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

        while (iteration < MAX_ITERATIONS) {
            iteration++;

            // Prune history before formatting to prevent overflow
            const prunedMessages = this.pruneHistory(currentMessages);
            const formattedMessages = formatMessages(prunedMessages);

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
                const assistantMsgObj: AgentMessage = {
                    role: 'assistant',
                    content: assistantMessage.content || '',
                    timestamp: Date.now(),
                    metadata: { tool_calls: assistantMessage.tool_calls }
                };

                this.history.push(assistantMsgObj);
                currentMessages.push(assistantMsgObj);

                // Execute tools
                for (const toolCall of assistantMessage.tool_calls) {
                    const tool = this.tools[toolCall.function.name];
                    if (tool) {
                        try {
                            const args = JSON.parse(toolCall.function.arguments);
                            const result = await tool.execute(args, this.activeContext);
                            const truncatedResult = this.truncateToolResult(result);

                            const toolMsg: AgentMessage = {
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                name: toolCall.function.name,
                                content: truncatedResult,
                                timestamp: Date.now()
                            };

                            this.history.push(toolMsg);
                            currentMessages.push(toolMsg);
                        } catch (e) {
                            const errorMsg: AgentMessage = {
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                name: toolCall.function.name,
                                content: JSON.stringify({ error: `Tool execution failed: ${e}` }),
                                timestamp: Date.now()
                            };
                            this.history.push(errorMsg);
                            currentMessages.push(errorMsg);
                        }
                    } else {
                        const errorMsg: AgentMessage = {
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            name: toolCall.function.name,
                            content: JSON.stringify({ error: `Tool not found: ${toolCall.function.name}` }),
                            timestamp: Date.now()
                        };
                        this.history.push(errorMsg);
                        currentMessages.push(errorMsg);
                    }
                }

                // Continue to next iteration to give the model the tool results
                continue;
            }

            // No tool calls (or tools disabled), return final content
            const content = assistantMessage?.content || '';
            this.history.push({ role: 'assistant', content, timestamp: Date.now() });
            return content;
        }

        return "He realizado el máximo número de pasos automáticos permitidos. Por favor, revisa el progreso o dime cómo continuar.";
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
