import { useState, useEffect, useRef } from 'react';
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

            <main className="pikkup-main">
                <section className="search-section">
                    <h1 className="search-title">Rastrea tu pedido</h1>
                    <p className="search-subtitle">
                        Ingresa tu número de guía para conocer el estado actual y la fecha estimada de entrega de tu envío.
                    </p>

                    <form className="search-form" onSubmit={handleSearch}>
                        <div className="input-group">
                            <label className="input-label">Número de seguimiento</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Ej: PK-98234710"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                    required
                                />
                                <button type="submit" className="btn-search" disabled={isLoading}>
                                    {isLoading ? 'Buscando...' : 'Buscar'}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>

                {trackingData && (
                    <section className="tracking-details-grid">
                        <div className="details-left-card">
                            <h2>{trackingData.status}</h2>
                            <div id="map-container" className="leaflet-map-element"></div>
                        </div>

                        <div className="details-right-card">
                            <h2>Historial de envío</h2>
                            {trackingData.timeline.map((step, index) => (
                                <div key={index}>
                                    <strong>{step.title}</strong>
                                    <p>{step.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <footer className="pikkup-footer">
                <div className="footer-container">
                    <div className="logo">Pikkup</div>
                    <div className="footer-links">
                        <a href="#ayuda">Ayuda</a>
                        <a href="#privacidad">Privacidad</a>
                        <a href="#servicio">Servicio</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;
