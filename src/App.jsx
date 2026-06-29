import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const MOCK_TRACKING_DATA = {
    'PK-98234710': {
        id: 'PK-98234710',
        status: 'En camino',
        badge: 'Tránsito prioritario',
        estimatedDelivery: 'Jueves, 24 Oct',
        origin: 'Lima, Perú',
        coordinates: [-12.1223, -77.0298],
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
    }
};

const generateMockData = (code) => {
    const normalized = code.toUpperCase().trim();
    if (MOCK_TRACKING_DATA[normalized]) {
        return MOCK_TRACKING_DATA[normalized];
    }

    const lat = -12.09 + (Math.random() - 0.5) * 0.07;
    const lng = -77.04 + (Math.random() - 0.5) * 0.05;

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

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('PK-98234710');
    const [trackingData, setTrackingData] = useState(MOCK_TRACKING_DATA['PK-98234710']);
    const [isLoading, setIsLoading] = useState(false);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setTimeout(() => {
            const data = generateMockData(searchQuery);
            setTrackingData(data);
            setActiveQuery(data.id);
            setIsLoading(false);
        }, 600);
    };

    useEffect(() => {
        const L = window.L;
        if (!L || !trackingData) return;

        if (!mapRef.current) {
            // Mapa
            const map = L.map('map-container', {
                zoomControl: false,
                attributionControl: false
            }).setView(trackingData.coordinates, 14);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(map);

            const marker = L.circleMarker(trackingData.coordinates, {
                color: '#ffffff',
                fillColor: '#080c24',
                fillOpacity: 1,
                radius: 8,
                weight: 3,
                stroke: true
            }).addTo(map);

            mapRef.current = map;
            markerRef.current = marker;
        } else {
            mapRef.current.setView(trackingData.coordinates, 14);
            if (markerRef.current) {
                markerRef.current.setLatLng(trackingData.coordinates);
            }
        }
    }, [trackingData]);

    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    return (
        <div className="pikkup-app">
            {/* NAVBAR */}
            <header className="pikkup-header">
                <div className="header-container">
                    <div className="logo">Pikkup</div>
                    <nav className="nav-menu">
                        <a href="#rastrear" className="nav-link active">Rastrear mi pedido</a>
                        <a href="#ubicaciones" className="nav-link">Ubicaciones</a>
                        <a href="#support" className="nav-link">Support</a>
                    </nav>
                    <button className="btn-login">Iniciar sesion</button>
                </div>
            </header>

            {/* main */}
            <main className="pikkup-main">
                {/* seccion de busqueda */}
                <section className="search-section">
                    <h1 className="search-title">Rastrea tu pedido</h1>
                    <p className="search-subtitle">
                        Ingresa tu número de guía para conocer el estado actual y la fecha estimada de entrega de tu envío.
                    </p>

                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="input-group">
                            <label htmlFor="tracking-input" className="input-label">Número de seguimiento</label>
                            <div className="input-wrapper">
                                <input
                                    id="tracking-input"
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
                </section>

                {/* grid */}
                {trackingData && (
                    <section className="tracking-details-grid">
                        {/* columna izquierda */}
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

                            {/* cards */}
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

                            {/* mapa */}
                            <div className="map-wrapper">
                                <div id="map-container" className="leaflet-map-element"></div>
                            </div>
                        </div>

                        {/* comlumna derechha */}
                        <div className="details-right-card">
                            <h2 className="history-title">Historial de envío</h2>

                            <div className="timeline-container">
                                {trackingData.timeline.map((step, index) => (
                                    <div key={index} className={`timeline-item ${step.state}`}>
                                        {/* marcador visual */}
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

                                        {/* detalles */}
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

            {/* FOOTER */}
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

export default App;
