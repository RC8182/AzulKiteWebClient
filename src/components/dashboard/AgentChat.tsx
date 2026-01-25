'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Loader2, X, MessageSquare, Sparkles, Paperclip, FileJson, FileText } from 'lucide-react';
import { AgentMessage, AgentResponse } from '@/lib/agents/types';
import { useDashboard } from '@/context/DashboardContext';

interface AgentChatProps {
    role: 'product_agent' | 'customer_support' | 'billing_admin';
    context?: any;
    title?: string;
    variant?: 'popup' | 'inline';
}

export default function AgentChat({ role, context, title = 'AI Assistant', variant = 'popup' }: AgentChatProps) {
    const router = useRouter();
    const { lang, dict } = useDashboard();
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(variant === 'inline');
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
            // Prevent body scroll on mobile when chat is open in popup mode
            if (variant === 'popup' && window.innerWidth < 768) {
                document.body.style.overflow = 'hidden';
            }
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [messages, isOpen]);

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() && files.length === 0 && isLoading) return;

        const messageContent = textToSend.trim() || (files.length > 0 ? `Subidos ${files.length} archivos` : '');

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
            formData.append('message', textToSend);
            formData.append('role', role);
            formData.append('sessionId', sessionId.current);
            formData.append('context', JSON.stringify({ ...context, language: lang }));

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
            router.refresh();
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Error de conexión. Reintenta.',
                timestamp: Date.now()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen && variant === 'popup') {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 flex items-center gap-2 z-50"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        );
    }

    const containerClasses = variant === 'popup'
        ? "fixed md:bottom-6 md:right-6 md:w-96 inset-0 md:inset-auto h-full md:h-[600px] bg-white dark:bg-gray-800 rounded-none md:rounded-2xl shadow-2xl border-0 md:border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden"
        : "w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden min-h-[500px]";

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${variant === 'popup' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <div className="flex items-center gap-2">
                    <Bot className={`w-5 h-5 ${variant === 'popup' ? 'text-white' : 'text-blue-600'}`} />
                    <span className={`font-semibold ${variant === 'popup' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{title}</span>
                </div>
                {variant === 'popup' && (
                    <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-2 rounded-lg transition-colors text-white">
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30 dark:bg-gray-900/10">
                {messages.length === 0 && (
                    <div className="text-center py-8 md:py-12 space-y-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Asistente IA</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto px-4">
                            Hola! Puedo ayudarte a categorizar productos, generar descripciones o pedirme: "Crea un producto simple llamado X con precio Y".
                        </p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[90%] md:max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-blue-600'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`p-3 md:p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'}`}>
                                {msg.content}
                                {msg.metadata?.suggestedActions && (
                                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        {msg.metadata.suggestedActions.map((action: any, aIdx: number) => (
                                            <button
                                                key={aIdx}
                                                onClick={() => handleSend(`Ejecuta: ${action.label}`)}
                                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 px-3 py-1.5 rounded-lg text-xs font-semibold"
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
                    <div className="flex justify-start pl-10">
                        <div className="flex space-x-1">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex gap-2 items-center">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-400 hover:text-blue-600"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                            if (e.target.files) {
                                const newFiles = Array.from(e.target.files).map(file => ({ file }));
                                setFiles(prev => [...prev, ...newFiles]);
                            }
                        }}
                        className="hidden"
                        accept=".pdf,.json,image/*"
                        capture="environment"
                    />
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="¿Qué producto cargamos?"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none max-h-32"
                            rows={1}
                        />
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || (!input.trim() && files.length === 0)}
                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

