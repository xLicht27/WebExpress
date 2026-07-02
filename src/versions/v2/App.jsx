import { useState, useEffect, useRef } from 'react';
import '../../App.css';

const MOCK_TRACKING_DATA = {
    'PK-98234710': {
        id: 'PK-98234710',
        status: 'En camino',
        badge: 'Tránsito prioritario',
        estimatedDelivery: 'Jueves, 24 Oct',
        origin: 'Callao, Perú',
        coordinates: [-12.0950, -77.0600],
        timeline: [
            { date: '22 Oct, 14:30', title: 'En tránsito', description: 'El paquete ha salido del centro de distribución regional.' },
            { date: '21 Oct, 09:15', title: 'En aduanas', description: 'Procesamiento de aduana completado.' },
            { date: '20 Oct, 18:00', title: 'Recibido', description: 'Recibido en puerto de Callao.' },
            { date: 'Pendiente', title: 'Entregado', description: 'Entrega final en domicilio.' }
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
            { date: 'Ayer, 16:30', title: 'Entregado', description: 'Entregado y firmado por el destinatario.' },
            { date: 'Ayer, 09:00', title: 'En reparto', description: 'El motorizado se encuentra en ruta.' },
            { date: '1 Oct, 11:00', title: 'Recibido en almacén', description: 'Ingreso al centro logístico de San Isidro.' },
            { date: '30 Sep, 14:00', title: 'Desaduanado', description: 'Aprobación de aduanas Callao.' }
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
            { date: 'Hoy, 09:00', title: 'En aduanas', description: 'Retenido temporalmente para inspección de documentación.' },
            { date: 'Ayer, 18:00', title: 'Llegada al país', description: 'Arribo al aeropuerto Jorge Chávez.' },
            { date: 'Pendiente', title: 'En tránsito', description: 'Despacho al almacén central.' },
            { date: 'Pendiente', title: 'Entregado', description: 'Entrega final en domicilio.' }
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
            { date: 'Ayer, 10:00', title: 'Retenido en almacén', description: 'Esperando pago de aranceles de importación.' },
            { date: '29 Jun, 15:00', title: 'En aduanas', description: 'Ingreso a aduana marítima.' },
            { date: '28 Jun, 08:00', title: 'Llegada a puerto', description: 'Ingreso a puerto del Callao.' }
        ]
    }
};

const LIMA_OFFICES = [
    { id: 'callao', name: 'Sede Central Callao', coords: [-12.0464, -77.1200], address: 'Av. Elmer Faucett 150', hours: 'Lun-Vie 8am - 6pm', phone: '(01) 511-2000' },
    { id: 'san-isidro', name: 'Oficina San Isidro', coords: [-12.0950, -77.0600], address: 'Av. Javier Prado Este 450', hours: 'Lun-Vie 8:30am - 6:30pm', phone: '(01) 422-3500' },
    { id: 'miraflores', name: 'Oficina Miraflores', coords: [-12.1223, -77.0298], address: 'Calle Shell 310', hours: 'Lun-Vie 9am - 7pm', phone: '(01) 445-9000' }
];

function V2App({ hideVersionLabel }) {
    const [activeTab, setActiveTab] = useState('rastrear');
    const [searchQuery, setSearchQuery] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const officeMapRef = useRef(null);
    const officeMarkersRef = useRef([]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchError('');
        const code = searchQuery.toUpperCase().trim();
        if (!code) return;

        setIsLoading(true);
        setTimeout(() => {
            if (MOCK_TRACKING_DATA[code]) {
                setTrackingData(MOCK_TRACKING_DATA[code]);
            } else {
                setTrackingData(null);
                setSearchError(`Código de seguimiento no encontrado. Intenta con: PK-98234710, PK-87214902, PK-54129087, PK-10293847`);
            }
            setIsLoading(false);
        }, 500);
    };

    // Tracking Map Effect
    useEffect(() => {
        const L = window.L;
        if (!L || !trackingData || activeTab !== 'rastrear') return;

        // Initialize Map
        if (!mapRef.current) {
            const container = document.getElementById('map-container-v2');
            if (!container) return;

            const map = L.map('map-container-v2', {
                zoomControl: true,
                attributionControl: false
            }).setView(trackingData.coordinates, 13);

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
            mapRef.current.setView(trackingData.coordinates, 13);
            if (markerRef.current) {
                markerRef.current.setLatLng(trackingData.coordinates);
            }
        }
    }, [trackingData, activeTab]);

    // Cleanup Tracking Map
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, [activeTab]);

    // Offices Map Effect
    useEffect(() => {
        const L = window.L;
        if (!L || activeTab !== 'ubicaciones') return;

        if (!officeMapRef.current) {
            const container = document.getElementById('office-map-container-v2');
            if (!container) return;

            const map = L.map('office-map-container-v2', {
                zoomControl: true,
                attributionControl: false
            }).setView([-12.085, -77.07], 11);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(map);

            // Add markers for all offices
            const markers = LIMA_OFFICES.map(office => {
                const marker = L.marker(office.coords)
                    .addTo(map)
                    .bindPopup(`<b>${office.name}</b><br/>${office.address}`);
                return { id: office.id, marker };
            });

            officeMapRef.current = map;
            officeMarkersRef.current = markers;
        }
    }, [activeTab]);

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
        alert('Gracias por contactarnos. Tu mensaje ha sido recibido (Simulación V2).');
        e.target.reset();
    };

    return (
        <div className="pikkup-app version-v2">
            <header className="pikkup-header">
                <div className="header-container">
                    <div className="logo">Pikkup {!hideVersionLabel && <span className="version-label">V2</span>}</div>
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
                                    <div className="demo-codes-helper">
                                        <span>Guías de demo: </span>
                                        {Object.keys(MOCK_TRACKING_DATA).map(code => (
                                            <button 
                                                key={code} 
                                                type="button" 
                                                className="demo-code-badge-btn"
                                                onClick={() => {
                                                    setSearchQuery(code);
                                                }}
                                            >
                                                {code}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                            {searchError && <p className="error-message-text">{searchError}</p>}
                        </section>

                        {trackingData && (
                            <section className="tracking-details-grid-v2">
                                <div className="details-left-card-v2">
                                    <div className="details-card-header">
                                        <div className="tracking-id-label">Guía #{trackingData.id}</div>
                                        <h2>{trackingData.status}</h2>
                                        <span className="badge-v2">{trackingData.badge}</span>
                                    </div>
                                    <div className="details-info-simple">
                                        <p><strong>Entrega estimada:</strong> {trackingData.estimatedDelivery}</p>
                                        <p><strong>Origen:</strong> {trackingData.origin}</p>
                                    </div>
                                    <div className="map-wrapper-v2">
                                        <div id="map-container-v2" className="leaflet-map-element-v2"></div>
                                    </div>
                                </div>

                                <div className="details-right-card-v2">
                                    <h2>Historial de envío</h2>
                                    <ul className="timeline-list-simple">
                                        {trackingData.timeline.map((step, index) => (
                                            <li key={index} className="timeline-item-simple">
                                                <span className="step-date-v2">{step.date}</span> - <strong>{step.title}</strong>
                                                <p className="step-desc-v2">{step.description}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>
                        )}
                    </>
                )}

                {activeTab === 'ubicaciones' && (
                    <section className="locations-simple-section">
                        <h2>Oficinas de WebExpress (V2)</h2>
                        <p className="section-desc">Selecciona una oficina para ubicarla interactivamente en el mapa.</p>
                        <div className="locations-interactive-grid-v2">
                            <div className="locations-list-v2">
                                {LIMA_OFFICES.map(office => (
                                    <div 
                                        key={office.id} 
                                        className="location-card-v2"
                                        onClick={() => handleCenterOffice(office)}
                                    >
                                        <h3>{office.name}</h3>
                                        <p>📍 {office.address}</p>
                                        <p>🕒 {office.hours}</p>
                                        <p>📞 {office.phone}</p>
                                        <button className="btn-center-map">Ubicar en mapa</button>
                                    </div>
                                ))}
                            </div>
                            <div className="map-wrapper-locations-v2">
                                <div id="office-map-container-v2" className="leaflet-map-element-v2"></div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'support' && (
                    <section className="support-simple-section">
                        <h2>Atención al Cliente y Soporte (V2)</h2>
                        <p className="section-desc">Escríbenos si tienes algún problema con tu entrega.</p>
                        <div className="support-simple-grid">
                            <div className="support-simple-info">
                                <h3>Canales de Contacto</h3>
                                <p><strong>Correo electrónico:</strong> soporte@webexpress.pe</p>
                                <p><strong>Teléfono de Ayuda:</strong> 0-800-12345 (Línea Gratuita)</p>
                                <p><strong>WhatsApp corporativo:</strong> +51 999 888 777</p>
                            </div>
                            <form className="support-simple-form" onSubmit={handleContactSubmit}>
                                <h3>Formulario de Contacto</h3>
                                <div className="form-group-simple">
                                    <label>Nombre Completo</label>
                                    <input type="text" placeholder="Tu nombre" required />
                                </div>
                                <div className="form-group-simple">
                                    <label>Correo Electrónico</label>
                                    <input type="email" placeholder="Tu correo" required />
                                </div>
                                <div className="form-group-simple">
                                    <label>Mensaje</label>
                                    <textarea placeholder="Describe tu consulta..." rows="4" required></textarea>
                                </div>
                                <button type="submit" className="btn-search">Enviar Mensaje</button>
                            </form>
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

export default V2App;
