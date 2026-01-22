'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';

interface WindData {
    avg_speed_kt?: number;
    gust_speed_kt?: number;
    avg_dir_deg?: number;
    timestamp?: string;
    sample_count?: number;
}

interface WebSocketContextValue {
    status: 'disconnected' | 'connecting' | 'connected' | 'error' | 'polling';
    windSpeed: number | null;
    windGust: number | null;
    windDirection: number | null;
    lastUpdate: string | null;
    reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

const RECONNECT_INTERVAL = 5000;
const POLLING_FALLBACK_INTERVAL = 10000;

interface WindSocketProviderProps {
    children: ReactNode;
}

export const WindSocketProvider: React.FC<WindSocketProviderProps> = ({ children }) => {
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error' | 'polling'>('disconnected');
    const [windSpeed, setWindSpeed] = useState<number | null>(null);
    const [windGust, setWindGust] = useState<number | null>(null);
    const [windDirection, setWindDirection] = useState<number | null>(null);
    const [lastUpdate, setLastUpdate] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
    const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const connectRef = useRef<() => void>(() => { });
    const isMountedRef = useRef(true);
    const maxReconnectAttempts = 5;

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const startPollingFallback = useCallback(() => {
        if (!isMountedRef.current) return;
        if (pollingTimerRef.current) return;

        console.log('[WSS-Context] Starting polling fallback...');
        setStatus('polling');

        const pollData = async () => {
            if (!isMountedRef.current) return;
            try {
                // Usar solo el endpoint 3min
                const response = await fetch('/api/anemometro/3min', { 
                    cache: 'no-store'
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('[WSS-Context] 3min endpoint response:', data);
                    
                    if (data && isMountedRef.current) {
                        // El endpoint 3min devuelve un array con el último dato
                        if (Array.isArray(data) && data.length > 0) {
                            const latestData = data[0];
                            setLastUpdate(new Date().toISOString());
                            setWindSpeed(Math.round(latestData.avg_speed_kt || 0));
                            setWindGust(Math.round(latestData.gust_speed_kt || 0));
                            setWindDirection(Math.round(latestData.avg_dir_deg || 0));
                            console.log('[WSS-Context] Polling data from 3min:', latestData);
                        } else if (data.avg_speed_kt !== undefined) {
                            // Si devuelve objeto directo
                            setLastUpdate(new Date().toISOString());
                            setWindSpeed(Math.round(data.avg_speed_kt || 0));
                            setWindGust(Math.round(data.gust_speed_kt || 0));
                            setWindDirection(Math.round(data.avg_dir_deg || 0));
                            console.log('[WSS-Context] Polling data from 3min (object):', data);
                        }
                    }
                } else {
                    console.warn('[WSS-Context] 3min endpoint failed:', response.status);
                }
                
            } catch (error) {
                if (isMountedRef.current) {
                    console.error('[WSS-Context] Polling error:', error);
                }
            }
        };

        // Poll inmediatamente
        pollData();

        // Configurar intervalo para polling continuo
        pollingTimerRef.current = setInterval(pollData, POLLING_FALLBACK_INTERVAL);
    }, []);

    const stopPollingFallback = useCallback(() => {
        if (pollingTimerRef.current) {
            clearInterval(pollingTimerRef.current);
            pollingTimerRef.current = null;
            console.log('[WSS-Context] Stopped polling fallback');
        }
    }, []);

    const connect = useCallback(() => {
        if (!isMountedRef.current) return;
        if (wsRef.current && wsRef.current.readyState < 2) return;

        if (reconnectTimerRef.current) {
            clearInterval(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }

        // Intentar diferentes URLs de WebSocket rotativamente
        const wsUrls = [
            'wss://azul-kite.ddns.net/ws/anemometro',
            'ws://azul-kite.ddns.net/ws/anemometro',
            'wss://azul-kite.ddns.net/ws',
            'ws://azul-kite.ddns.net:3000/ws/anemometro',
            'wss://azul-kite.ddns.net'
        ];

        // Rotar URL según el número de intento
        const wsUrl = wsUrls[reconnectAttemptsRef.current % wsUrls.length];

        console.log(`[WSS-Context] Attempting to connect (Attempt ${reconnectAttemptsRef.current + 1}) to:`, wsUrl);
        setStatus('connecting');
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = (event) => {
            if (!isMountedRef.current || wsRef.current !== ws) return;

            const socket = event.target as WebSocket;
            console.log('[WSS-Context] Connection established to:', socket.url);
            setStatus('connected');
            reconnectAttemptsRef.current = 0;
            // NO detener polling - mantener como respaldo
            if (reconnectTimerRef.current) {
                clearInterval(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }

            // Enviar ping inicial
            socket.send(JSON.stringify({
                type: 'ping',
                payload: { timestamp: Date.now() }
            }));
        };

        ws.onmessage = (event) => {
            if (!isMountedRef.current || wsRef.current !== ws) return;

            try {
                console.log('[WSS-Context] Message received:', event.data);
                const message = JSON.parse(event.data);

                // Manejar diferentes tipos de mensajes
                if (message.type === 'pong') {
                    console.log('[WSS-Context] Pong received from server');
                    return;
                }

                if (message.type === 'heartbeat') {
                    console.log('[WSS-Context] Heartbeat received');
                    setLastUpdate(new Date().toISOString());
                    return;
                }

                if (message.type === 'connection') {
                    console.log('[WSS-Context] Connection message:', message.payload);
                    return;
                }

                if (message.type && message.payload) {
                    const payload = message.payload;

                    if (message.type === 'agg_3min' || message.type === 'raw') {
                        setWindSpeed(Math.round(payload.avg_speed_kt || 0));
                        setWindGust(Math.round(payload.gust_speed_kt || payload.gust_speed || 0));
                        setWindDirection(Math.round(payload.avg_dir_deg || payload.wind_dir || 0));
                        
                        if (message.type === 'agg_3min') {
                            console.log(`[WSS-Data] Viento=${payload.avg_speed_kt} kts, Racha=${payload.gust_speed_kt} kts, Dirección=${payload.avg_dir_deg}°`);
                        }
                    }
                    
                    setLastUpdate(new Date().toISOString());
                }
            } catch (e) {
                console.error('[WSS-Context] Error processing message:', e, 'Raw data:', event.data);
            }
        };

        ws.onerror = (event) => {
            if (!isMountedRef.current || wsRef.current !== ws) return;

            const socket = event.target as WebSocket;
            // Solo logeamos como advertencia ya que onclose se encargará de la reconexión
            console.warn(`[WSS-Context] WebSocket connection issue: ${socket.url}. State: ${socket.readyState}`);
        };

        ws.onclose = (event) => {
            if (!isMountedRef.current || wsRef.current !== ws) {
                console.log('[WSS-Context] Ignoring close event for inactive/unmounted socket');
                return;
            }

            console.log('[WSS-Context] Connection closed. Code:', event.code, 'Reason:', event.reason, 'Clean:', event.wasClean);
            setStatus('disconnected');

            reconnectAttemptsRef.current++;
            console.log('[WSS-Context] Reconnect attempt:', reconnectAttemptsRef.current, 'of', maxReconnectAttempts);

            if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                console.log('[WSS-Context] Max reconnection attempts reached, starting polling fallback');
                startPollingFallback();
            } else if (!reconnectTimerRef.current) {
                console.log('[WSS-Context] Setting up reconnection timer...');
                reconnectTimerRef.current = setInterval(() => {
                    if (isMountedRef.current) {
                        console.log('[WSS-Context] Attempting to reconnect...');
                        connectRef.current();
                    } else if (reconnectTimerRef.current) {
                        clearInterval(reconnectTimerRef.current);
                        reconnectTimerRef.current = null;
                    }
                }, RECONNECT_INTERVAL);
            }
        };
    }, [startPollingFallback, stopPollingFallback]);

    // Actualizar la ref siempre que connect cambie
    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    const manualReconnect = useCallback(() => {
        console.log('[WSS-Context] Manual reconnection requested');
        reconnectAttemptsRef.current = 0; // Reset attempts counter
        // NO detener polling - mantener como respaldo
        if (reconnectTimerRef.current) {
            clearInterval(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
        }
        connect();
    }, [connect]);

    useEffect(() => {
        // Iniciar polling inmediatamente para tener datos rápidos
        startPollingFallback();
        
        // Intentar WebSocket en paralelo
        const timeoutId = setTimeout(() => {
            connect();
        }, 0);
        
        return () => {
            clearTimeout(timeoutId);
            if (reconnectTimerRef.current) clearInterval(reconnectTimerRef.current);
            if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect, startPollingFallback]);

    const value: WebSocketContextValue = {
        status,
        windSpeed,
        windGust,
        windDirection,
        lastUpdate,
        reconnect: manualReconnect
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWindSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWindSocket must be used within a WindSocketProvider');
    }
    return context;
};

// Función auxiliar para convertir grados a dirección cardinal
export const getWindDirectionText = (degrees: number | null): string => {
    if (degrees === null) return '--';
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
};
