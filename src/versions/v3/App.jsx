import { useState, useEffect, useRef } from 'react';
import '../../App.css';

const SIMULATION_ROUTE = [
    { name: 'Recibido en Callao', coords: [-12.0464, -77.1200], stepIndex: 2 },
    { name: 'Procesado en Aduanas', coords: [-12.0680, -77.0980], stepIndex: 1 },
    { name: 'En centro de distribución', coords: [-12.0950, -77.0600], stepIndex: 1 },
    { name: 'En ruta de reparto', coords: [-12.1120, -77.0420], stepIndex: 0 },
    { name: 'Entregado en Miraflores', coords: [-12.1223, -77.0298], stepIndex: 3 }
];

const MOCK_TRACKING_DATA = {
    'PK-98234710': {
        id: 'PK-98234710',
        status: 'En camino',
        badge: 'Tránsito prioritario',
        estimatedDelivery: 'Jueves, 24 Oct',
        origin: 'Callao, Perú',
        coordinates: [-12.0950, -77.0600],
        timeline: [
            { date: '22 Oct, 14:30', title: 'En tránsito', description: 'El paquete ha salido del centro de distribución regional.', state: 'active' },
            { date: '21 Oct, 09:15', title: 'En aduanas', description: 'Procesamiento de aduana completado.', state: 'completed' },
            { date: '20 Oct, 18:00', title: 'Recibido', description: 'Recibido en puerto de Callao.', state: 'completed' },
            { date: 'Pendiente', title: 'Entregado', description: 'Entrega final en domicilio.', state: 'pending' }
        ]
    },
    'PK-87214902': {
        id: 'PK-87214902',
        status: 'Entregado',
        badge: 'Envío internacional',
        estimatedDelivery: 'Entregado ayer',
        origin: 'Miami, USA',
        coordinates: [-12.1150, -77.0350],
        timeline: [
            { date: 'Ayer, 16:30', title: 'Entregado', description: 'Entregado y firmado por el destinatario.', state: 'completed' },
            { date: 'Ayer, 09:00', title: 'En reparto', description: 'El motorizado se encuentra en ruta.', state: 'completed' },
            { date: '1 Oct, 11:00', title: 'Recibido en almacén', description: 'Ingreso al centro logístico de San Isidro.', state: 'completed' },
            { date: '30 Sep, 14:00', title: 'Desaduanado', description: 'Aprobación de aduanas Callao.', state: 'completed' }
        ]
    },
    'PK-54129087': {
        id: 'PK-54129087',
        status: 'En aduanas',
        badge: 'Envío estándar',
        estimatedDelivery: 'Lunes, 28 Oct',
        origin: 'Madrid, España',
        coordinates: [-12.0464, -77.1200],
        timeline: [
            { date: 'Hoy, 09:00', title: 'En aduanas', description: 'Retenido temporalmente para inspección de documentación.', state: 'active' },
            { date: 'Ayer, 18:00', title: 'Llegada al país', description: 'Arribo al aeropuerto Jorge Chávez.', state: 'completed' },
            { date: 'Pendiente', title: 'En tránsito', description: 'Despacho al almacén central.', state: 'pending' },
            { date: 'Pendiente', title: 'Entregado', description: 'Entrega final en domicilio.', state: 'pending' }
        ]
    },
    'PK-10293847': {
        id: 'PK-10293847',
        status: 'Demorado',
        badge: 'Requiere atención',
        estimatedDelivery: 'Pendiente de resolución',
        origin: 'Santiago, Chile',
        coordinates: [-12.0833, -77.0833],
        timeline: [
            { date: 'Ayer, 10:00', title: 'Retenido en almacén', description: 'Esperando pago de aranceles de importación.', state: 'active' },
            { date: '29 Jun, 15:00', title: 'En aduanas', description: 'Ingreso a aduana marítima.', state: 'completed' },
            { date: '28 Jun, 08:00', title: 'Llegada a puerto', description: 'Ingreso a puerto del Callao.', state: 'completed' }
        ]
    }
};

const LIMA_OFFICES = [
    { id: 'callao', name: 'Sede Central Callao', coords: [-12.0464, -77.1200], address: 'Av. Elmer Faucett 150', hours: 'Lun-Vie 8:00 AM - 6:00 PM | Sáb 9:00 AM - 1:00 PM', phone: '(01) 511-2000' },
    { id: 'san-isidro', name: 'Oficina San Isidro', coords: [-12.0950, -77.0600], address: 'Av. Javier Prado Este 450', hours: 'Lun-Vie 8:30 AM - 6:30 PM | Sáb 9:00 AM - 1:00 PM', phone: '(01) 422-3500' },
    { id: 'miraflores', name: 'Oficina Miraflores', coords: [-12.1223, -77.0298], address: 'Calle Shell 310', hours: 'Lun-Vie 9:00 AM - 7:00 PM | Sáb 9:00 AM - 2:00 PM', phone: '(01) 445-9000' }
];

const FAQS_DATA = [
    { question: '¿Cómo realizo el seguimiento de mi envío?', answer: 'Solo debes ingresar tu número de seguimiento (ej: PK-98234710) en la barra de búsqueda de la pestaña de rastreo. El sistema cargará el mapa de ubicación actual del paquete y el historial detallado de la ruta.' },
    { question: '¿Cuáles son los horarios de entrega?', answer: 'Las entregas se programan de lunes a sábado desde las 8:00 AM hasta las 8:00 PM. Los días domingos y feriados no se realizan despachos rutinarios.' },
    { question: '¿Qué significa que mi pedido esté "Demorado"?', answer: 'Esto indica que el envío requiere alguna acción, como la aclaración de datos en aduanas o el pago de aranceles de importación pendientes. Te recomendamos contactarnos a través de soporte para brindarte asistencia inmediata.' },
    { question: '¿Tienen cobertura de envíos a nivel nacional?', answer: 'Sí, realizamos envíos a nivel nacional abarcando las principales ciudades y departamentos del Perú con tiempos estimados de entrega entre 2 y 5 días útiles dependiendo de la provincia.' }
];

function V3App({ hideVersionLabel }) {
    const [activeTab, setActiveTab] = useState('rastrear');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('PK-98234710');
    const [trackingData, setTrackingData] = useState(MOCK_TRACKING_DATA['PK-98234710']);
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [simIndex, setSimIndex] = useState(-1);
    const [isSimulating, setIsSimulating] = useState(false);
    const [searchError, setSearchError] = useState('');
    
    // FAQ state
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const polylineRef = useRef(null);
    const simIntervalRef = useRef(null);

    const officeMapRef = useRef(null);
    const officeMarkersRef = useRef([]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchError('');
        const code = searchQuery.toUpperCase().trim();
        if (!code) return;

        setIsLoading(true);
        stopSimulation();

        setTimeout(() => {
            if (MOCK_TRACKING_DATA[code]) {
                const data = JSON.parse(JSON.stringify(MOCK_TRACKING_DATA[code]));
                setTrackingData(data);
                setActiveQuery(data.id);
            } else {
                setTrackingData(null);
                setSearchError(`Código de seguimiento no encontrado. Intenta con: PK-98234710, PK-87214902, PK-54129087, PK-10293847`);
            }
            setIsLoading(false);
        }, 500);
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

    // Tracking Map Effect
    useEffect(() => {
        const L = window.L;
        if (!L || !trackingData || activeTab !== 'rastrear') return;

        if (!mapRef.current) {
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
            // Update tile layer
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

            // Update marker
            mapRef.current.setView(trackingData.coordinates, 13);
            if (markerRef.current) {
                markerRef.current.setLatLng(trackingData.coordinates);
                markerRef.current.setStyle({
                    fillColor: isDarkMode ? '#10b981' : '#080c24'
                });
            }
        }

        // Draw polyline route
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
    }, [trackingData, isDarkMode, isSimulating, simIndex, activeTab]);

    // Cleanup Tracking Map
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
                polylineRef.current = null;
            }
        };
    }, [activeTab]);

    // Offices Map Effect
    useEffect(() => {
        const L = window.L;
        if (!L || activeTab !== 'ubicaciones') return;

        if (!officeMapRef.current) {
            const map = L.map('office-map-container-v3', {
                zoomControl: false,
                attributionControl: false
            }).setView([-12.085, -77.07], 11);

            L.tileLayer(
                isDarkMode 
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                { maxZoom: 19 }
            ).addTo(map);

            const markers = LIMA_OFFICES.map(office => {
                const marker = L.marker(office.coords)
                    .addTo(map)
                    .bindPopup(`<b>${office.name}</b><br/>${office.address}`);
                return { id: office.id, marker };
            });

            officeMapRef.current = map;
            officeMarkersRef.current = markers;
        } else {
            // Update tile layer
            officeMapRef.current.eachLayer(layer => {
                if (layer instanceof L.TileLayer) {
                    officeMapRef.current.removeLayer(layer);
                }
            });
            L.tileLayer(
                isDarkMode 
                    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
                { maxZoom: 19 }
            ).addTo(officeMapRef.current);
        }
    }, [activeTab, isDarkMode]);

    // Cleanup Offices Map
    useEffect(() => {
        return () => {
            if (officeMapRef.current) {
                officeMapRef.current.remove();
                officeMapRef.current = null;
                officeMarkersRef.current = [];
            }
        };
    }, [activeTab]);

    const handleCenterOffice = (office) => {
        if (officeMapRef.current) {
            officeMapRef.current.setView(office.coords, 14);
            const found = officeMarkersRef.current.find(m => m.id === office.id);
            if (found) {
                found.marker.openPopup();
            }
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        alert('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo en breve.');
        e.target.reset();
    };

    const handleFaqToggle = (index) => {
        setOpenFaqIndex(prev => (prev === index ? null : index));
    };

    return (
        <div className={`pikkup-app version-v3 ${isDarkMode ? 'dark-mode' : ''}`}>
            <header className="pikkup-header">
                <div className="header-container">
                    <div className="logo">Pikkup {!hideVersionLabel && <span className="version-label">V3 Premium</span>}</div>
                    <nav className="nav-menu">
                        <button 
                            className={`nav-link-btn ${activeTab === 'rastrear' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rastrear')}
                        >
                            Rastrear mi pedido
                        </button>
                        <button 
                            className={`nav-link-btn ${activeTab === 'ubicaciones' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ubicaciones')}
                        >
                            Ubicaciones
                        </button>
                        <button 
                            className={`nav-link-btn ${activeTab === 'support' ? 'active' : ''}`}
                            onClick={() => setActiveTab('support')}
                        >
                            Support
                        </button>
                    </nav>
                    <div className="header-actions">
                        <button 
                            className={`btn-theme-toggle ${isDarkMode ? 'active' : ''}`}
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            title="Cambiar Tema"
                        >
                            {isDarkMode ? '☀️ Claro' : '🌙 Oscuro'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="pikkup-main">
                {activeTab === 'rastrear' && (
                    <>
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
                                    <div className="demo-codes-helper">
                                        <span>Guías de demo: </span>
                                        {Object.keys(MOCK_TRACKING_DATA).map(code => (
                                            <button 
                                                key={code} 
                                                type="button" 
                                                className={`demo-code-badge-btn ${activeQuery === code ? 'active' : ''}`}
                                                onClick={() => {
                                                    setSearchQuery(code);
                                                    setTrackingData(JSON.parse(JSON.stringify(MOCK_TRACKING_DATA[code])));
                                                    setActiveQuery(code);
                                                    setSearchError('');
                                                    stopSimulation();
                                                }}
                                            >
                                                {code} ({MOCK_TRACKING_DATA[code].status})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>

                            {searchError && <p className="error-message-text">{searchError}</p>}

                            {activeQuery === 'PK-98234710' && trackingData && (
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
                    </>
                )}

                {activeTab === 'ubicaciones' && (
                    <section className="locations-section">
                        <div className="section-header-locations">
                            <h2>Centros de Distribución WebExpress</h2>
                            <p>Contamos con oficinas de atención y distribución en Lima Metropolitana.</p>
                        </div>
                        <div className="locations-interactive-grid-v2">
                            <div className="locations-list-v2">
                                {LIMA_OFFICES.map(office => (
                                    <div 
                                        key={office.id} 
                                        className="location-card-v3"
                                        onClick={() => handleCenterOffice(office)}
                                    >
                                        <h3>{office.name}</h3>
                                        <p>📍 {office.address}</p>
                                        <p>🕒 {office.hours}</p>
                                        <p>📞 {office.phone}</p>
                                        <button className="btn-center-map-v3">Ubicar en mapa</button>
                                    </div>
                                ))}
                            </div>
                            <div className="map-wrapper-locations-v3">
                                <div id="office-map-container-v3" className="leaflet-map-element"></div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'support' && (
                    <section className="support-section-v3">
                        <div className="support-header-v3">
                            <h2>Soporte y Preguntas Frecuentes</h2>
                            <p>Resuelve tus dudas o escríbenos directamente a nuestro equipo de atención.</p>
                        </div>
                        <div className="support-grid-v3">
                            {/* FAQ Accordion */}
                            <div className="faq-container-v3">
                                <h3>Preguntas Frecuentes</h3>
                                <div className="accordion-v3">
                                    {FAQS_DATA.map((faq, index) => (
                                        <div 
                                            key={index} 
                                            className={`accordion-item-v3 ${openFaqIndex === index ? 'active' : ''}`}
                                        >
                                            <button 
                                                className="accordion-header-btn-v3"
                                                onClick={() => handleFaqToggle(index)}
                                            >
                                                <span>{faq.question}</span>
                                                <span className="accordion-icon">{openFaqIndex === index ? '−' : '+'}</span>
                                            </button>
                                            <div className="accordion-content-v3">
                                                <p>{faq.answer}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="contact-form-container-v3">
                                <h3>Envíanos un Mensaje</h3>
                                <form className="support-form-v3" onSubmit={handleContactSubmit}>
                                    <div className="form-group-v3">
                                        <label>Nombre Completo</label>
                                        <input type="text" placeholder="Tu nombre y apellido" required />
                                    </div>
                                    <div className="form-group-v3">
                                        <label>Correo Electrónico</label>
                                        <input type="email" placeholder="correo@ejemplo.com" required />
                                    </div>
                                    <div className="form-group-v3">
                                        <label>Mensaje o Consulta</label>
                                        <textarea placeholder="Escribe aquí tu consulta en detalle..." rows="5" required></textarea>
                                    </div>
                                    <button type="submit" className="btn-search-v3">Enviar Formulario</button>
                                </form>
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
