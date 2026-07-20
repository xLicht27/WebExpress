import { useState, useEffect, useRef } from 'react';
import '../../App.css';

const SIMULATION_ROUTE = [
    { name: 'Sede Callao (Origen)', coords: [-12.0464, -77.1200], step: 0, desc: 'Envío registrado y clasificado en centro de origen.' },
    { name: 'Centro Logístico Lima Norte', coords: [-12.0680, -77.0980], step: 1, desc: 'Paquete recibido en almacén central y verificado.' },
    { name: 'Distribución Lima Centro', coords: [-12.0950, -77.0600], step: 2, desc: 'Envío asignado al transportista en ruta local.' },
    { name: 'Reparto Miraflores', coords: [-12.1120, -77.0420], step: 2, desc: 'Courier en tránsito hacia la dirección del destinatario.' },
    { name: 'Entregado en Destino', coords: [-12.1223, -77.0298], step: 3, desc: 'Entrega realizada con éxito. Firma digital registrada.' }
];

const MOCK_TRACKING_DATA = {
    'PK-98234710': {
        id: 'PK-98234710',
        status: 'En camino',
        statusClass: 'status-transit',
        badge: 'Courier Express',
        estimatedDelivery: 'Jueves, 24 Oct - Tarde',
        origin: 'Callao, Perú',
        destination: 'Miraflores, Lima',
        sender: 'ALICORP S.A.A.',
        recipient: 'JEAN D*** D***Z',
        weight: '1.20 Kg',
        pieces: '1 de 1',
        coordinates: [-12.0950, -77.0600],
        progressStep: 2, // 0: Registrado, 1: Clasificado, 2: En ruta, 3: Entregado
        timeline: [
            { date: '22 Oct, 14:30', location: 'CALLAO - CENTRAL', title: 'En tránsito local', description: 'En tránsito hacia el centro de distribución local.', state: 'active' },
            { date: '21 Oct, 09:15', location: 'LIMA - CENTRO', title: 'Clasificado en sede', description: 'Clasificación de paquete culminada de forma exitosa.', state: 'completed' },
            { date: '20 Oct, 18:00', location: 'CALLAO - RECEPCION', title: 'Paquete Recibido', description: 'Recibido en punto de origen, Callao / Lima.', state: 'completed' }
        ]
    },
    'PK-87214902': {
        id: 'PK-87214902',
        status: 'Entregado',
        statusClass: 'status-delivered',
        badge: 'Envío Internacional',
        estimatedDelivery: 'Entregado (21 Oct, 16:30)',
        origin: 'Miami, USA',
        destination: 'San Isidro, Lima',
        sender: 'AMAZON EXPORT S.R.L.',
        recipient: 'JEAN D*** D***Z',
        weight: '3.50 Kg',
        pieces: '1 de 1',
        coordinates: [-12.1223, -77.0298],
        progressStep: 3,
        receiverName: 'JEAN DIAZ DIAZ',
        receiverDni: '72******',
        timeline: [
            { date: '21 Oct, 16:30', location: 'SAN ISIDRO - DOMICILIO', title: 'Entregado', description: 'Entregado conforme en el domicilio del destinatario. Cargo firmado.', state: 'completed' },
            { date: '21 Oct, 09:00', location: 'LIMA - REPARTO', title: 'En ruta de reparto', description: 'El motorizado se encuentra en ruta para entrega física.', state: 'completed' },
            { date: '20 Oct, 11:00', location: 'SAN ISIDRO - LOGISTICA', title: 'Recibido en almacén', description: 'Ingreso al almacén de distribución de San Isidro.', state: 'completed' },
            { date: '19 Oct, 14:00', location: 'CALLAO - ADUANAS', title: 'Desaduanado', description: 'Levante autorizado de aduanas marítimas Callao.', state: 'completed' }
        ]
    },
    'PK-54129087': {
        id: 'PK-54129087',
        status: 'En aduanas',
        statusClass: 'status-warning',
        badge: 'Envío Estándar',
        estimatedDelivery: 'Pendiente de trámite aduanero',
        origin: 'Madrid, España',
        destination: 'Cercado de Lima',
        sender: 'REPSOL COMERCIAL',
        recipient: 'CORPORACION LOG. PERU',
        weight: '12.80 Kg',
        pieces: '2 de 2',
        coordinates: [-12.0464, -77.1200],
        progressStep: 1,
        timeline: [
            { date: 'Hoy, 09:00', location: 'CALLAO - ADUANA AEREA', title: 'Retenido en aduanas', description: 'Paquete retenido para inspección física y homologación de mercancía.', state: 'active' },
            { date: 'Ayer, 18:00', location: 'CALLAO - PUERTO', title: 'Llegada al país', description: 'Arribo del contenedor al puerto de destino Callao.', state: 'completed' },
            { date: '18 Oct, 08:00', location: 'MADRID - ORIGEN', title: 'Despachado', description: 'Envío marítimo despachado rumbo a Perú.', state: 'completed' }
        ]
    },
    'PK-10293847': {
        id: 'PK-10293847',
        status: 'Demorado',
        statusClass: 'status-error',
        badge: 'Atención Requerida',
        estimatedDelivery: 'Pendiente de pago de tributos',
        origin: 'Santiago, Chile',
        destination: 'La Molina, Lima',
        sender: 'LATAM MERCHANDISE',
        recipient: 'EDUARDO D*** R***S',
        weight: '0.85 Kg',
        pieces: '1 de 1',
        coordinates: [-12.0833, -77.0833],
        progressStep: 1,
        timeline: [
            { date: 'Ayer, 10:00', location: 'LIMA - CENTRAL', title: 'Exceso de franquicia', description: 'Envío supera límite de USD 200. Esperando pago de aranceles SUNAT.', state: 'active' },
            { date: '29 Jun, 15:00', location: 'CALLAO - ADUANAS', title: 'En inspección', description: 'Ingreso a canal de inspección aduanera y aforo.', state: 'completed' },
            { date: '28 Jun, 08:00', location: 'CALLAO - PUERTO', title: 'Llegada a puerto', description: 'Llegada de la embarcación al puerto del Callao.', state: 'completed' }
        ]
    }
};



const LIMA_OFFICES = [
    { id: 'callao', name: 'Sede Principal Callao', coords: [-12.0464, -77.1200], address: 'Av. Elmer Faucett 150, Callao', hours: 'Lun-Vie 8:00 AM - 6:00 PM | Sáb 9:00 AM - 1:00 PM', phone: '(01) 511-2000' },
    { id: 'san-isidro', name: 'Centro Logístico San Isidro', coords: [-12.0950, -77.0600], address: 'Av. Javier Prado Este 450, San Isidro', hours: 'Lun-Vie 8:30 AM - 6:30 PM | Sáb 9:00 AM - 1:00 PM', phone: '(01) 422-3500' },
    { id: 'miraflores', name: 'Oficina Express Miraflores', coords: [-12.1223, -77.0298], address: 'Calle Shell 310, Miraflores', hours: 'Lun-Vie 9:00 AM - 7:00 PM | Sáb 9:00 AM - 2:00 PM', phone: '(01) 445-9000' }
];

const FAQS_DATA = [
    { question: '¿Cómo puedo saber el número de mi guía de rastreo?', answer: 'El número de guía (tracking ID) es un código de 11 caracteres (ej: PK-98234710) que se encuentra en la boleta de despacho o ticket digital enviado a tu correo en el momento de realizar el envío.' },
    { question: '¿Qué hago si mi envío requiere atención (Demorado)?', answer: 'Si un envío muestra un estado de demora o requiere atención (canal de aduanas o tributos), debes contactar a nuestro Centro de Soporte adjuntando el comprobante de compra o factura. Puedes usar el formulario de contacto o el número gratuito.' },
    { question: '¿Realizan entregas los fines de semana y feriados?', answer: 'Realizamos entregas regulares los días sábados de 9:00 AM a 2:00 PM. No realizamos entregas domingos ni días feriados nacionales oficiales.' },
    { question: '¿Qué es el servicio Courier Express?', answer: 'Es nuestro servicio de entrega prioritaria garantizada en un plazo máximo de 24 horas para Lima y Callao, y 48 horas para las principales capitales de provincia a nivel nacional.' }
];

function V4App({ hideVersionLabel }) {
    const [activeTab, setActiveTab] = useState('rastrear');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeQuery, setActiveQuery] = useState('PK-98234710');
    const [trackingData, setTrackingData] = useState(MOCK_TRACKING_DATA['PK-98234710']);
    const [isLoading, setIsLoading] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [simIndex, setSimIndex] = useState(-1);
    const [isSimulating, setIsSimulating] = useState(false);
    const [searchError, setSearchError] = useState('');
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
                setSearchError(`Número de guía no encontrado. Intenta con los códigos demo: PK-98234710, PK-87214902, PK-54129087, PK-10293847`);
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

        updatePackagePosition(SIMULATION_ROUTE[0].coords, 0);

        simIntervalRef.current = setInterval(() => {
            index++;
            if (index >= SIMULATION_ROUTE.length) {
                clearInterval(simIntervalRef.current);
                simIntervalRef.current = null;
                setIsSimulating(false);
                setSimIndex(-1);
                alert('¡Simulación completada! La ruta de entrega se ha cubierto de forma satisfactoria.');
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
            updated.progressStep = routeStep.step;
            
            // Generate dynamic states and descriptions for timeline
            if (index === 0) {
                updated.status = 'Registrado';
                updated.statusClass = 'status-transit';
                updated.timeline = [
                    { date: 'Hoy, 08:00', location: 'CALLAO - CENTRAL', title: 'Recibido en almacén', description: routeStep.desc, state: 'active' },
                    { date: 'Pendiente', location: 'LIMA - CENTRO', title: 'Clasificado logístico', description: 'Por procesar en cinta de distribución.', state: 'pending' },
                    { date: 'Pendiente', location: 'MIRAFLORES - RUTA', title: 'En ruta de reparto', description: 'En espera de courier.', state: 'pending' },
                    { date: 'Pendiente', location: 'DESTINO', title: 'Entregado', description: 'Entrega final.', state: 'pending' }
                ];
            } else if (index === 1 || index === 2) {
                updated.status = 'Clasificado';
                updated.statusClass = 'status-transit';
                updated.timeline = [
                    { date: 'Hoy, 08:00', location: 'CALLAO - CENTRAL', title: 'Recibido en almacén', description: 'Paquete procesado en cinta.', state: 'completed' },
                    { date: 'Hoy, 09:30', location: 'LIMA - LOGISTICA', title: 'Clasificado logístico', description: routeStep.desc, state: 'active' },
                    { date: 'Pendiente', location: 'MIRAFLORES - RUTA', title: 'En ruta de reparto', description: 'En espera de courier.', state: 'pending' },
                    { date: 'Pendiente', location: 'DESTINO', title: 'Entregado', description: 'Entrega final.', state: 'pending' }
                ];
            } else if (index === 3) {
                updated.status = 'En reparto';
                updated.statusClass = 'status-transit';
                updated.timeline = [
                    { date: 'Hoy, 08:00', location: 'CALLAO - CENTRAL', title: 'Recibido en almacén', description: 'Paquete procesado en cinta.', state: 'completed' },
                    { date: 'Hoy, 09:30', location: 'LIMA - LOGISTICA', title: 'Clasificado logístico', description: 'Clasificación completada.', state: 'completed' },
                    { date: 'Hoy, 10:45', location: 'MIRAFLORES - RUTA', title: 'En ruta de reparto', description: routeStep.desc, state: 'active' },
                    { date: 'Pendiente', location: 'DESTINO', title: 'Entregado', description: 'Entrega final.', state: 'pending' }
                ];
            } else if (index === 4) {
                updated.status = 'Entregado';
                updated.statusClass = 'status-delivered';
                updated.receiverName = 'JEAN DIAZ DIAZ';
                updated.receiverDni = '72******';
                updated.timeline = [
                    { date: 'Hoy, 08:00', location: 'CALLAO - CENTRAL', title: 'Recibido en almacén', description: 'Paquete procesado en cinta.', state: 'completed' },
                    { date: 'Hoy, 09:30', location: 'LIMA - LOGISTICA', title: 'Clasificado logístico', description: 'Clasificación completada.', state: 'completed' },
                    { date: 'Hoy, 10:45', location: 'MIRAFLORES - RUTA', title: 'En ruta de reparto', description: 'Asignado a courier.', state: 'completed' },
                    { date: 'Hoy, 11:30', location: 'DESTINO - DOMICILIO', title: 'Entregado con éxito', description: routeStep.desc, state: 'completed' }
                ];
            }
            return updated;
        });
    };

    // Tracking Map Effect
    useEffect(() => {
        const L = window.L;
        if (!L || !trackingData || activeTab !== 'rastrear') return;

        if (!mapRef.current) {
            const map = L.map('map-container-v4', {
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
                fillColor: isDarkMode ? '#f59e0b' : '#3b82f6',
                fillOpacity: 1,
                radius: 10,
                weight: 3,
                stroke: true
            }).addTo(map);

            mapRef.current = map;
            markerRef.current = marker;
        } else {
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

            mapRef.current.setView(trackingData.coordinates, 13);
            if (markerRef.current) {
                markerRef.current.setLatLng(trackingData.coordinates);
                markerRef.current.setStyle({
                    fillColor: isDarkMode ? '#f59e0b' : '#2563eb'
                });
            }
        }

        // Draw Simulation Route Line
        if (isSimulating) {
            const routePoints = SIMULATION_ROUTE.slice(0, simIndex + 1).map(p => p.coords);
            const totalRoute = SIMULATION_ROUTE.map(p => p.coords);

            // Backing line
            if (!polylineRef.current) {
                polylineRef.current = L.polyline(totalRoute, {
                    color: isDarkMode ? '#374151' : '#e2e8f0',
                    weight: 4,
                    opacity: 0.8
                }).addTo(mapRef.current);
            }

            // Animated progress line
            const currentLine = L.polyline(routePoints, {
                color: isDarkMode ? '#f59e0b' : '#2563eb',
                weight: 5,
                dashArray: '4, 6'
            }).addTo(mapRef.current);

            return () => {
                mapRef.current.removeLayer(currentLine);
            };
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
            }
        };
    }, [activeTab]);

    // Offices Map Effect
    useEffect(() => {
        const L = window.L;
        if (!L || activeTab !== 'ubicaciones') return;

        if (!officeMapRef.current) {
            const map = L.map('office-map-container-v4', {
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
        alert('¡Formulario enviado con éxito! Tu número de caso es C-' + Math.floor(Math.random() * 90000 + 10000) + '. Nos comunicaremos contigo en breve.');
        e.target.reset();
    };

    const handleFaqToggle = (index) => {
        setOpenFaqIndex(prev => (prev === index ? null : index));
    };

    const handleDownloadReceipt = () => {
        alert('Generando comprobante digital de entrega para el número de guía ' + activeQuery + '...');
        window.print();
    };

    return (
        <div className={`pikkup-app version-v4 ${isDarkMode ? 'dark-mode' : ''}`}>
            <header className="pikkup-header">
                <div className="header-container">
                    <div className="logo">
                        Pikkup 
                        {!hideVersionLabel && <span className="version-label">V4 Olva Pro</span>}
                    </div>
                    <nav className="nav-menu">
                        <button 
                            className={`nav-link-btn ${activeTab === 'rastrear' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rastrear')}
                        >
                            📦 Rastrear Envíos
                        </button>
                        <button 
                            className={`nav-link-btn ${activeTab === 'ubicaciones' ? 'active' : ''}`}
                            onClick={() => setActiveTab('ubicaciones')}
                        >
                            📍 Centros Logísticos
                        </button>
                        <button 
                            className={`nav-link-btn ${activeTab === 'support' ? 'active' : ''}`}
                            onClick={() => setActiveTab('support')}
                        >
                            💬 Soporte y FAQ
                        </button>
                    </nav>
                    <div className="header-actions">
                        <button 
                            className={`btn-theme-toggle ${isDarkMode ? 'active' : ''}`}
                            onClick={() => setIsDarkMode(!isDarkMode)}
                        >
                            {isDarkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
                        </button>
                    </div>
                </div>
            </header>

            <main className="pikkup-main">
                {activeTab === 'rastrear' && (
                    <>
                        <section className="search-section">
                            {/* Barcode representation */}
                            <div className="barcode-container">
                                <div className="barcode-stripe"></div>
                                <span className="barcode-text">{activeQuery || 'PK-TRACKING'}</span>
                            </div>
                            <h1 className="search-title">Consulta de Envíos Nacionales</h1>
                            <p className="search-subtitle">
                                Conoce el estado exacto de distribución de tus documentos, paquetes o carga a nivel nacional.
                            </p>

                            <form className="search-form" onSubmit={handleSearch}>
                                <div className="input-group">
                                    <label htmlFor="tracking-input-v4" className="input-label">Número de Guía o Remito</label>
                                    <div className="input-wrapper">
                                        <input
                                            id="tracking-input-v4"
                                            type="text"
                                            placeholder="Ej: PK-98234710"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="search-input"
                                            required
                                        />
                                        <button type="submit" className="btn-search" disabled={isLoading}>
                                            {isLoading ? <span className="spinner"></span> : 'Buscar Guía'}
                                        </button>
                                    </div>
                                    
                                    <div className="demo-codes-helper">
                                        <span>Guías de Demostración: </span>
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
                                    <span className="simulation-info">
                                        <strong>Módulo de pruebas:</strong> Puedes iniciar la simulación para animar el vehículo en la ruta logística.
                                    </span>
                                    <button 
                                        onClick={startSimulation} 
                                        className={`btn-simulate ${isSimulating ? 'simulating' : ''}`}
                                    >
                                        {isSimulating ? '🛑 Detener Ruta' : '🚚 Simular Ruta'}
                                    </button>
                                </div>
                            )}
                        </section>

                        {trackingData && (
                            <div className="courier-tracker-wrapper">
                                
                                {/* Progress Stepper */}
                                <div className="progress-stepper-card">
                                    <div className="stepper-track-line">
                                        <div 
                                            className="stepper-progress-fill" 
                                            style={{ width: `${(trackingData.progressStep / 3) * 100}%` }}
                                        ></div>
                                    </div>
                                    <div className="stepper-nodes">
                                        <div className={`step-node ${trackingData.progressStep >= 0 ? 'completed' : ''} ${trackingData.progressStep === 0 ? 'active' : ''}`}>
                                            <div className="step-circle">📦</div>
                                            <span className="step-label">Registrado</span>
                                        </div>
                                        <div className={`step-node ${trackingData.progressStep >= 1 ? 'completed' : ''} ${trackingData.progressStep === 1 ? 'active' : ''}`}>
                                            <div className="step-circle">🏭</div>
                                            <span className="step-label">Clasificado</span>
                                        </div>
                                        <div className={`step-node ${trackingData.progressStep >= 2 ? 'completed' : ''} ${trackingData.progressStep === 2 ? 'active' : ''}`}>
                                            <div className="step-circle">🚚</div>
                                            <span className="step-label">En Ruta</span>
                                        </div>
                                        <div className={`step-node ${trackingData.progressStep >= 3 ? 'completed' : ''} ${trackingData.progressStep === 3 ? 'active' : ''}`}>
                                            <div className="step-circle">✅</div>
                                            <span className="step-label">Entregado</span>
                                        </div>
                                    </div>
                                </div>

                                <section className="tracking-details-grid">
                                    
                                    {/* Left Panel: Courier Sheet & Map */}
                                    <div className="details-left-card">
                                        <div className="left-card-header">
                                            <div>
                                                <span className="tracking-id-label">NRO DE GUÍA</span>
                                                <h2 className="tracking-status-title">{trackingData.id}</h2>
                                            </div>
                                            <div className={`courier-badge ${trackingData.statusClass}`}>
                                                {trackingData.status}
                                            </div>
                                        </div>

                                        {/* Corporate Data Grid */}
                                        <div className="courier-sheet-grid">
                                            <div className="sheet-item">
                                                <span className="sheet-label">Remitente</span>
                                                <span className="sheet-value">{trackingData.sender}</span>
                                            </div>
                                            <div className="sheet-item">
                                                <span className="sheet-label">Destinatario</span>
                                                <span className="sheet-value">{trackingData.recipient}</span>
                                            </div>
                                            <div className="sheet-item">
                                                <span className="sheet-label">Origen</span>
                                                <span className="sheet-value">{trackingData.origin}</span>
                                            </div>
                                            <div className="sheet-item">
                                                <span className="sheet-label">Destino</span>
                                                <span className="sheet-value">{trackingData.destination}</span>
                                            </div>
                                            <div className="sheet-item">
                                                <span className="sheet-label">Peso total</span>
                                                <span className="sheet-value">{trackingData.weight}</span>
                                            </div>
                                            <div className="sheet-item">
                                                <span className="sheet-label">Piezas</span>
                                                <span className="sheet-value">{trackingData.pieces}</span>
                                            </div>
                                        </div>

                                        {trackingData.receiverName && (
                                            <div className="delivery-receiver-box">
                                                <h4>Detalle de Recepción</h4>
                                                <p><strong>Recibido por:</strong> {trackingData.receiverName}</p>
                                                <p><strong>Documento de identidad (DNI):</strong> {trackingData.receiverDni}</p>
                                            </div>
                                        )}

                                        <div className="map-wrapper" style={{ marginTop: '20px' }}>
                                            <div id="map-container-v4" className="leaflet-map-element"></div>
                                        </div>

                                        <button 
                                            className="btn-download-receipt" 
                                            onClick={handleDownloadReceipt}
                                        >
                                            🖨️ Imprimir Hoja de Envío / Guía
                                        </button>
                                    </div>

                                    {/* Right Panel: Advanced Logistics Timeline */}
                                    <div className="details-right-card">
                                        <h2 className="history-title">Kardex de Eventos / Logística</h2>

                                        <div className="timeline-container">
                                            {trackingData.timeline.map((step, index) => (
                                                <div key={index} className={`timeline-item ${step.state}`}>
                                                    <div className="timeline-marker">
                                                        <div className="marker-node">
                                                            {step.state === 'completed' && (
                                                                <svg className="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
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
                                                        <span className="timeline-location">{step.location || 'SEDE CENTRAL'}</span>
                                                        <h3 className="timeline-step-title">{step.title}</h3>
                                                        <p className="timeline-description">{step.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'ubicaciones' && (
                    <section className="locations-section">
                        <div className="section-header-locations">
                            <h2>Centros Logísticos de Distribución</h2>
                            <p>Ubicaciones físicas y centros de entrega en Lima Metropolitana y Callao.</p>
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
                                        <p>🕒 Horario: {office.hours}</p>
                                        <p>📞 Teléfono: {office.phone}</p>
                                        <button className="btn-center-map-v3">Centrar en Mapa</button>
                                    </div>
                                ))}
                            </div>
                            <div className="map-wrapper-locations-v3">
                                <div id="office-map-container-v4" className="leaflet-map-element"></div>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'support' && (
                    <section className="support-section-v3">
                        <div className="support-header-v3">
                            <h2>Centro de Soporte y FAQ</h2>
                            <p>Canales de ayuda inmediata y resolución de dudas sobre tu servicio de transporte.</p>
                        </div>
                        <div className="support-grid-v3">
                            
                            {/* Accordion FAQ */}
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

                            {/* Contact Box and Form */}
                            <div className="contact-form-container-v3">
                                <h3>Canal de Reclamaciones / Dudas</h3>
                                <form className="support-form-v3" onSubmit={handleContactSubmit}>
                                    <div className="form-group-v3">
                                        <label>Nombre del Solicitante</label>
                                        <input type="text" placeholder="Ej: Jean Diaz" required />
                                    </div>
                                    <div className="form-group-v3">
                                        <label>Correo de Contacto</label>
                                        <input type="email" placeholder="ejemplo@correo.com" required />
                                    </div>
                                    <div className="form-group-v3">
                                        <label>Detalle de Consulta o Suceso</label>
                                        <textarea placeholder="Describe el estado de tu guía o suceso..." rows="5" required></textarea>
                                    </div>
                                    <button type="submit" className="btn-search-v3">Registrar Ticket</button>
                                </form>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <footer className="pikkup-footer">
                <div className="footer-container">
                    <div className="logo">Pikkup Courier</div>
                    <div className="footer-links">
                        <a href="#ayuda">Centro de Ayuda</a>
                        <a href="#privacidad">Políticas de Privacidad</a>
                        <a href="#servicio">Términos del Servicio</a>
                    </div>
                    <div className="footer-copyright">
                        © 2026 Pikkup Courier & Logística. Todos los derechos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default V4App;
