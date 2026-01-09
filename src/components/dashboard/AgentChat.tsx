'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Loader2, X, MessageSquare, Sparkles, Paperclip, FileJson, FileText } from 'lucide-react';
import { AgentMessage, AgentResponse } from '@/lib/agents/types';

interface AgentChatProps {
    role: 'product_agent' | 'customer_support' | 'billing_admin';
    context?: any;
    title?: string;
}

export default function AgentChat({ role, context, title = 'AI Assistant' }: AgentChatProps) {
    const router = useRouter();
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<{ file: File; preview?: string }[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sessionId = useRef(`session_${Math.random().toString(36).substr(2, 9)}`);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Clean up preview URLs
    useEffect(() => {
        return () => {
            files.forEach(f => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
        };
    }, [files]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[index].preview) {
                URL.revokeObjectURL(newFiles[index].preview!);
            }
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const handleSend = async () => {
        if (!input.trim() && files.length === 0 && isLoading) return;

        const messageContent = input.trim() || (files.length > 0 ? `Subidos ${files.length} archivos: ${files.map(f => f.file.name).join(', ')}` : '');

        const userMsg: AgentMessage = {
            role: 'user',
            content: messageContent,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('message', input);
            formData.append('role', role);
            formData.append('sessionId', sessionId.current);
            formData.append('context', JSON.stringify(context || { language: 'es' }));

            files.forEach(f => {
                formData.append('file', f.file);
            });

            const response = await fetch('/api/agents/chat', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data: AgentResponse = await response.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.content,
                timestamp: Date.now(),
                metadata: { suggestedActions: data.suggestedActions }
            }]);

            setFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = '';

            // Refresh dashboard data as a tool might have changed state
            router.refresh();
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'I encountered an error. Please try again.',
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-2 z-50"
            >
                <MessageSquare className="w-6 h-6" />
                <span className="font-medium">Agent AI</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-blue-600 text-white">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <span className="font-semibold">{title}</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-8 space-y-2">
                        <Sparkles className="w-8 h-8 text-blue-500 mx-auto" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Hola! Soy tu asistente de productos. ¿En qué puedo ayudarte hoy?
                        </p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-2 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                                {msg.content}

                                {msg.metadata?.suggestedActions && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {msg.metadata.suggestedActions.map((action: any, aIdx: number) => (
                                            <button
                                                key={aIdx}
                                                onClick={() => {
                                                    setInput(`Apply action: ${action.label}`);
                                                    handleSend();
                                                }}
                                                className="bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-50 transition-colors"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-2 items-center text-gray-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Pensando...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                        {files.map((fileData, idx) => (
                            <div key={idx} className="relative group flex items-center bg-blue-50 dark:bg-gray-700 p-2 rounded-lg border border-blue-100 dark:border-gray-600 max-w-[150px]">
                                {fileData.preview ? (
                                    <img src={fileData.preview} alt="preview" className="w-8 h-8 object-cover rounded mr-2" />
                                ) : (
                                    fileData.file.type === 'application/json' ? <FileJson className="w-5 h-5 text-blue-500 mr-2" /> : <FileText className="w-5 h-5 text-blue-500 mr-2" />
                                )}
                                <span className="text-[10px] truncate text-gray-700 dark:text-gray-300 flex-1">{fileData.file.name}</span>
                                <button
                                    onClick={() => removeFile(idx)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.json,image/*"
                        multiple
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        title="Adjuntar PDF, JSON o Fotos"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || (!input.trim() && files.length === 0)}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
