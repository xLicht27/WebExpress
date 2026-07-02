import { useState, useEffect, useRef } from 'react';
import '../../App.css';

const SIMULATION_ROUTE = [
    { name: 'Recibido en Callao', coords: [-12.0464, -77.1200], stepIndex: 2 },
    { name: 'Procesado en Aduanas', coords: [-12.0680, -77.0980], stepIndex: 1 },
    { name: 'En centro de distribución', coords: [-12.0950, -77.0600], stepIndex: 1 },
    { name: 'En ruta de reparto', coords: [-12.1120, -77.0420], stepIndex: 0 },
    { name: 'Entregado en Miraflores', coords: [-12.1223, -77.0298], stepIndex: 3 }
];

const INITIAL_MOCK_DATA = {
    id: 'PK-98234710',
    status: 'En camino',
    badge: 'Tránsito prioritario',
    estimatedDelivery: 'Jueves, 24 Oct',
    origin: 'Lima, Perú',
    coordinates: [-12.0950, -77.0600],
    timeline: [
        {
            date: '22 Oct, 14:30',
            title: 'En tránsito',
            description: 'El paquete ha salido del centro de distribución regional en Lima.',
            state: 'active'
        },
        {
            date: '21 Oct, 09:15',
            title: 'En aduanas',
            description: 'Procesamiento de aduana completado satisfactoriamente.',
            state: 'completed'
        },
        {
            date: '20 Oct, 18:00',
            title: 'Recibido',
            description: 'Recibido en punto de origen, Callao / Lima.',
            state: 'completed'
        },
        {
            date: 'Pendiente',
            title: 'Entregado',
            description: 'Entrega final en domicilio del destinatario.',
            state: 'pending'
        }
    ]
};

const generateMockData = (code) => {
    const normalized = code.toUpperCase().trim();
    if (normalized === 'PK-98234710') {
        return JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    }

    const lat = -12.09 + (Math.random() - 0.5) * 0.05;
    const lng = -77.04 + (Math.random() - 0.5) * 0.04;

    return {
        id: normalized || 'PK-CUSTOM',
        status: 'En camino',
        badge: 'Envío estándar',
        estimatedDelivery: 'En 3 días hábiles',
        origin: 'Lima, Perú',
        coordinates: [lat, lng],
        timeline: [
            {
                date: 'Hoy, 10:00',
                title: 'En tránsito',
                description: 'El paquete se encuentra en ruta hacia el centro de distribución local.',
                state: 'active'
            },
            {
                date: 'Ayer, 16:45',
                title: 'Recibido',
                description: 'El paquete ha ingresado a la central de Lima / Callao.',
                state: 'completed'
            },
            {
                date: 'Pendiente',
                title: 'Entregado',
                description: 'Entrega final en domicilio del destinatario.',
                state: 'pending'
            }
        ]
    };
};

function V3App({ hideVersionLabel }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('PK-98234710');
    const [trackingData, setTrackingData] = useState(INITIAL_MOCK_DATA);
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [simIndex, setSimIndex] = useState(-1);
    const [isSimulating, setIsSimulating] = useState(false);

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const polylineRef = useRef(null);
    const simIntervalRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        // Stop any running simulation
        stopSimulation();

        setTimeout(() => {
            const data = generateMockData(searchQuery);
            setTrackingData(data);
            setActiveQuery(data.id);
            setIsLoading(false);
        }, 600);
    };

    const stopSimulation = () => {
        if (simIntervalRef.current) {
            clearInterval(simIntervalRef.current);
            simIntervalRef.current = null;
        }
        setIsSimulating(false);
        setSimIndex(-1);
    };

    const startSimulation = () => {
        if (isSimulating) {
            stopSimulation();
            return;
        }

        setIsSimulating(true);
        setSimIndex(0);
        let index = 0;

        // Reset to first step of the route
        updatePackagePosition(SIMULATION_ROUTE[0].coords, 0);

        simIntervalRef.current = setInterval(() => {
            index++;
            if (index >= SIMULATION_ROUTE.length) {
                clearInterval(simIntervalRef.current);
                simIntervalRef.current = null;
                setIsSimulating(false);
                setSimIndex(-1);
                alert('¡Simulación completada! El paquete ha llegado a su destino.');
                return;
            }

            setSimIndex(index);
            updatePackagePosition(SIMULATION_ROUTE[index].coords, index);
        }, 2500);
    };

    const updatePackagePosition = (coords, index) => {
        setTrackingData(prev => {
            if (!prev) return prev;
            
            const updated = JSON.parse(JSON.stringify(prev));
            updated.coordinates = coords;
            
            // Dynamically adjust status and timeline based on route index
            const routeStep = SIMULATION_ROUTE[index];
            if (index === 0) {
                updated.status = 'Recibido en Origen';
                updated.timeline = [
                    { date: 'Hoy, 08:00', title: 'Recibido', description: 'Recibido en Callao / Puerto.', state: 'active' },
                    { date: 'Pendiente', title: 'En aduanas', description: 'Trámite aduanero pendiente.', state: 'pending' },
                    { date: 'Pendiente', title: 'En tránsito', description: 'Ruta al centro de distribución.', state: 'pending' },
                    { date: 'Pendiente', title: 'Entregado', description: 'Entrega final.', state: 'pending' }
                ];
            } else if (index === 1) {
                updated.status = 'En Aduanas';
                updated.timeline = [
                    { date: 'Hoy, 08:00', title: 'Recibido', description: 'Recibido en Callao / Puerto.', state: 'completed' },
                    { date: 'Hoy, 09:30', title: 'En aduanas', description: 'En proceso de inspección aduanera.', state: 'active' },
                    { date: 'Pendiente', title: 'En tránsito', description: 'Ruta al centro de distribución.', state: 'pending' },
                    { date: 'Pendiente', title: 'Entregado', description: 'Entrega final.', state: 'pending' }
                ];
            } else if (index === 2 || index === 3) {
                updated.status = 'En Camino';
                updated.timeline = [
                    { date: 'Hoy, 08:00', title: 'Recibido', description: 'Recibido en Callao / Puerto.', state: 'completed' },
                    { date: 'Hoy, 09:30', title: 'En aduanas', description: 'Aduana completada.', state: 'completed' },
                    { date: 'Hoy, 10:45', title: 'En tránsito', description: routeStep.name, state: 'active' },
                    { date: 'Pendiente', title: 'Entregado', description: 'Entrega final.', state: 'pending' }
                ];
            } else if (index === 4) {
                updated.status = 'Entregado';
                updated.timeline = [
                    { date: 'Hoy, 08:00', title: 'Recibido', description: 'Recibido en Callao / Puerto.', state: 'completed' },
                    { date: 'Hoy, 09:30', title: 'En aduanas', description: 'Aduana completada.', state: 'completed' },
                    { date: 'Hoy, 10:45', title: 'En tránsito', description: 'Enviado desde centro logístico.', state: 'completed' },
                    { date: 'Hoy, 11:30', title: 'Entregado', description: 'Entregado satisfactoriamente en destino.', state: 'completed' }
                ];
            }
            return updated;
        });
    };

    useEffect(() => {
        return () => {
            if (simIntervalRef.current) {
                clearInterval(simIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        const L = window.L;
        if (!L || !trackingData) return;

        if (!mapRef.current) {
            // Create map
            const map = L.map('map-container-v3', {
                zoomControl: false,
                attributionControl: false
            }).setView(trackingData.coordinates, 13);

            L.tileLayer(
                isDarkMode 
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', 
                { maxZoom: 19 }
            ).addTo(map);

            // Add marker
            const marker = L.circleMarker(trackingData.coordinates, {
                color: '#ffffff',
                fillColor: isDarkMode ? '#10b981' : '#080c24',
                fillOpacity: 1,
                radius: 9,
                weight: 3,
                stroke: true
            }).addTo(map);

            mapRef.current = map;
            markerRef.current = marker;
        } else {
            // Update tile layer based on dark mode
            mapRef.current.eachLayer(layer => {
                if (layer instanceof L.TileLayer) {
                    mapRef.current.removeLayer(layer);
                }
            });
            L.tileLayer(
                isDarkMode 
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                { maxZoom: 19 }
            ).addTo(mapRef.current);

            // Update marker position and color
            mapRef.current.setView(trackingData.coordinates, 13);
            if (markerRef.current) {
                markerRef.current.setLatLng(trackingData.coordinates);
                markerRef.current.setStyle({
                    fillColor: isDarkMode ? '#10b981' : '#080c24'
                });
            }
        }

        // Draw simulation polyline path
        if (isSimulating) {
            const currentRoutePoints = SIMULATION_ROUTE.slice(0, simIndex + 1).map(p => p.coords);
            if (polylineRef.current) {
                polylineRef.current.setLatLngs(currentRoutePoints);
            } else {
                polylineRef.current = L.polyline(currentRoutePoints, {
                    color: isDarkMode ? '#10b981' : '#080c24',
                    weight: 4,
                    dashArray: '5, 8',
                    opacity: 0.8
                }).addTo(mapRef.current);
            }
        } else {
            if (polylineRef.current) {
                polylineRef.current.remove();
                polylineRef.current = null;
            }
        }
    }, [trackingData, isDarkMode, isSimulating, simIndex]);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
                polylineRef.current = null;
            }
        };
    }, []);

    return (
        <div className={`pikkup-app version-v3 ${isDarkMode ? 'dark-mode' : ''}`}>
            <header className="pikkup-header">
                <div className="header-container">
                    <div className="logo">Pikkup {!hideVersionLabel && <span className="version-label">V3 Premium</span>}</div>
                    <nav className="nav-menu">
                        <a href="#rastrear" className="nav-link active">Rastrear mi pedido</a>
                        <a href="#ubicaciones" className="nav-link">Ubicaciones</a>
                        <a href="#support" className="nav-link">Support</a>
                    </nav>
                    <div className="header-actions">
                        <button 
                            className={`btn-theme-toggle ${isDarkMode ? 'active' : ''}`}
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            title="Cambiar Tema"
                        >
                            {isDarkMode ? '☀️ Claro' : '🌙 Oscuro'}
                        </button>
                        <button className="btn-login" onClick={() => alert('Inicio de sesión no implementado en esta versión.')}>Iniciar sesión</button>
                    </div>
                </div>
            </header>

            <main className="pikkup-main">
                <section className="search-section">
                    <h1 className="search-title">Rastrea tu pedido</h1>
                    <p className="search-subtitle">
                        Ingresa tu número de guía para conocer el estado actual y la fecha estimada de entrega de tu envío.
                    </p>

                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="input-group">
                            <label htmlFor="tracking-input-v3" className="input-label">Número de seguimiento</label>
                            <div className="input-wrapper">
                                <input
                                    id="tracking-input-v3"
                                    type="text"
                                    placeholder="Ej: PK-98234710"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                    required
                                />
                                <button type="submit" className="btn-search" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="spinner"></span>
                                    ) : (
                                        <>
                                            <svg className="icon-search" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                            </svg>
                                            Buscar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {activeQuery === 'PK-98234710' && (
                        <div className="simulation-control-box">
                            <span className="simulation-info">Esta guía soporta simulación interactiva de ruta en tiempo real.</span>
                            <button 
                                onClick={startSimulation} 
                                className={`btn-simulate ${isSimulating ? 'simulating' : ''}`}
                            >
                                {isSimulating ? '🛑 Detener Simulación' : '⚡ Simular Movimiento'}
                            </button>
                        </div>
                    )}
                </section>

                {trackingData && (
                    <section className="tracking-details-grid">
                        <div className="details-left-card">
                            <div className="left-card-header">
                                <div>
                                    <div className="tracking-id-label">Guía #{activeQuery}</div>
                                    <h2 className="tracking-status-title">{trackingData.status}</h2>
                                </div>
                                <div className="badge-priority">
                                    <svg className="icon-truck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13" />
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                                        <circle cx="5.5" cy="18.5" r="2.5" />
                                        <circle cx="18.5" cy="18.5" r="2.5" />
                                    </svg>
                                    {trackingData.badge}
                                </div>
                            </div>

                            <div className="info-cards-row">
                                <div className="info-card">
                                    <div className="info-card-label">Entrega estimada</div>
                                    <div className="info-card-value">{trackingData.estimatedDelivery}</div>
                                </div>
                                <div className="info-card">
                                    <div className="info-card-label">Origen</div>
                                    <div className="info-card-value">{trackingData.origin}</div>
                                </div>
                            </div>

                            <div className="map-wrapper">
                                <div id="map-container-v3" className="leaflet-map-element"></div>
                            </div>
                        </div>

                        <div className="details-right-card">
                            <h2 className="history-title">Historial de envío</h2>

                            <div className="timeline-container">
                                {trackingData.timeline.map((step, index) => (
                                    <div key={index} className={`timeline-item ${step.state}`}>
                                        <div className="timeline-marker">
                                            <div className="marker-node">
                                                {step.state === 'completed' && (
                                                    <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                )}
                                                {step.state === 'active' && (
                                                    <div className="marker-active-dot"></div>
                                                )}
                                            </div>
                                            {index < trackingData.timeline.length - 1 && (
                                                <div className="marker-line"></div>
                                            )}
                                        </div>

                                        <div className="timeline-content">
                                            <div className="timeline-date">{step.date}</div>
                                            <h3 className="timeline-step-title">{step.title}</h3>
                                            <p className="timeline-description">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <footer className="pikkup-footer">
                <div className="footer-container">
                    <div className="logo">Pikkup</div>
                    <div className="footer-links">
                        <a href="#ayuda">Ayuda</a>
                        <a href="#privacidad">Acuerdos de privacidad</a>
                        <a href="#servicio">Acuerdos de servicio</a>
                    </div>
                    <div className="footer-copyright">
                        © 2026 Pikkup. Todos los derechos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default V3App;
