'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Bot, User, Loader2, X, MessageSquare, Sparkles, Paperclip, FileJson, FileText } from 'lucide-react';
import { AgentMessage, AgentResponse } from '@/lib/agents/types';

interface AgentChatProps {
    role: 'product_agent' | 'customer_support' | 'billing_admin';
    context?: any;
    title?: string;
    variant?: 'popup' | 'inline';
}

export default function AgentChat({ role, context, title = 'AI Assistant', variant = 'popup' }: AgentChatProps) {
    const router = useRouter();
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

    const handleSend = async (overrideInput?: string) => {
        const textToSend = overrideInput || input;
        if (!textToSend.trim() && files.length === 0 && isLoading) return;

        const messageContent = textToSend.trim() || (files.length > 0 ? `Subidos ${files.length} archivos: ${files.map(f => f.file.name).join(', ')}` : '');

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

    if (!isOpen && variant === 'popup') {
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

    const containerClasses = variant === 'popup'
        ? "fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden"
        : "w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden min-h-[600px]";

    return (
        <div className={containerClasses}>
            {/* Header */}
            <div className={`p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between ${variant === 'popup' ? 'bg-blue-600 text-white' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <div className="flex items-center gap-2">
                    <Bot className={`w-5 h-5 ${variant === 'popup' ? 'text-white' : 'text-blue-600'}`} />
                    <span className={`font-semibold ${variant === 'popup' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{title}</span>
                </div>
                {variant === 'popup' && (
                    <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded transition-colors text-white">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-gray-900/10">
                {messages.length === 0 && (
                    <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-10 h-10" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Asistente Inteligente de Catálogo</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                            Hola! Puedo ayudarte a categorizar productos, generar descripciones, auditar el stock o realizar cambios masivos.
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mt-6">
                            {['¿Qué productos no tienen categoría?', 'Ayúdame a organizar el stock', 'Genera descripciones para los nuevos'].map((text, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(text)}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                                >
                                    {text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-blue-600'}`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'}`}>
                                {msg.content}

                                {msg.metadata?.suggestedActions && (
                                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                                        {msg.metadata.suggestedActions.map((action: any, aIdx: number) => (
                                            <button
                                                key={aIdx}
                                                onClick={() => handleSend(`Ejecuta: ${action.label}`)}
                                                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
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
                        <div className="flex gap-3 items-center text-gray-500 text-sm italic">
                            <div className="flex space-x-1">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                            </div>
                            <span>El agente está trabajando...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3 max-h-32 overflow-y-auto p-1">
                        {files.map((fileData, idx) => (
                            <div key={idx} className="relative group flex items-center bg-blue-50 dark:bg-gray-700/50 p-2 rounded-lg border border-blue-100 dark:border-gray-600 max-w-[150px]">
                                {fileData.preview ? (
                                    <img src={fileData.preview} alt="preview" className="w-8 h-8 object-cover rounded mr-2 shadow-sm" />
                                ) : (
                                    fileData.file.type === 'application/json' ? <FileJson className="w-5 h-5 text-blue-500 mr-2" /> : <FileText className="w-5 h-5 text-blue-500 mr-2" />
                                )}
                                <span className="text-[10px] truncate text-gray-700 dark:text-gray-300 flex-1">{fileData.file.name}</span>
                                <button
                                    onClick={() => removeFile(idx)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-3 items-end">
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
                        className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-xl transition-all"
                        title="Adjuntar"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="¿Cómo puedo ayudarte con el catálogo hoy?"
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-900 transition-all resize-none max-h-32"
                            rows={1}
                        />
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || (!input.trim() && files.length === 0)}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
