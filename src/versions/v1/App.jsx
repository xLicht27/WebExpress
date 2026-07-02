import { useState } from 'react';
import '../../App.css';

const MOCK_TRACKING_DATA = {
    'PK-98234710': {
        id: 'PK-98234710',
        status: 'En camino',
        badge: 'Tránsito prioritario',
        estimatedDelivery: 'Jueves, 24 Oct',
        origin: 'Lima, Perú',
        timeline: [
            {
                date: '22 Oct, 14:30',
                title: 'En tránsito',
                description: 'El paquete ha salido del centro de distribución regional en Lima.'
            },
            {
                date: '21 Oct, 09:15',
                title: 'En aduanas',
                description: 'Procesamiento de aduana completado satisfactoriamente.'
            },
            {
                date: '20 Oct, 18:00',
                title: 'Recibido',
                description: 'Recibido en punto de origen, Callao / Lima.'
            },
            {
                date: 'Pendiente',
                title: 'Entregado',
                description: 'Entrega final en domicilio del destinatario.'
            }
        ]
    }
};

const generateMockData = (code) => {
    const normalized = code.toUpperCase().trim();
    if (MOCK_TRACKING_DATA[normalized]) {
        return MOCK_TRACKING_DATA[normalized];
    }
    return {
        id: normalized || 'PK-CUSTOM',
        status: 'En camino',
        badge: 'Envío estándar',
        estimatedDelivery: 'En 3 días hábiles',
        origin: 'Lima, Perú',
        timeline: [
            {
                date: 'Hoy, 10:00',
                title: 'En tránsito',
                description: 'El paquete se encuentra en ruta hacia el centro de distribución local.'
            },
            {
                date: 'Ayer, 16:45',
                title: 'Recibido',
                description: 'El paquete ha ingresado a la central de Lima / Callao.'
            },
            {
                date: 'Pendiente',
                title: 'Entregado',
                description: 'Entrega final en domicilio del destinatario.'
            }
        ]
    };
};

function V1App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setTimeout(() => {
            const data = generateMockData(searchQuery);
            setTrackingData(data);
            setIsLoading(false);
        }, 600);
    };

    return (
        <div className="pikkup-app version-v1">
            <header className="pikkup-header">
                <div className="header-container">
                    <div className="logo">Pikkup <span className="version-label">V1</span></div>
                    <nav className="nav-menu">
                        <a href="#rastrear" className="nav-link active">Rastrear mi pedido</a>
                        <a href="#ubicaciones" className="nav-link">Ubicaciones</a>
                        <a href="#support" className="nav-link">Support</a>
                    </nav>
                    <button className="btn-login" onClick={() => alert('Inicio de sesión no implementado en esta versión.')}>Iniciar sesión</button>
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
                    <section className="tracking-details-grid-v1">
                        <div className="details-left-card-v1">
                            <div className="details-card-header">
                                <div className="tracking-id-label">Guía #{trackingData.id}</div>
                                <h2>Estado: {trackingData.status}</h2>
                                <span className="badge-v1">{trackingData.badge}</span>
                            </div>
                            <div className="details-info-simple">
                                <p><strong>Entrega estimada:</strong> {trackingData.estimatedDelivery}</p>
                                <p><strong>Origen:</strong> {trackingData.origin}</p>
                            </div>
                        </div>

                        <div className="details-right-card-v1">
                            <h2>Historial de envío</h2>
                            <ul className="timeline-list-simple">
                                {trackingData.timeline.map((step, index) => (
                                    <li key={index} className="timeline-item-simple">
                                        <span className="step-date-v1">{step.date}</span> - <strong>{step.title}</strong>
                                        <p className="step-desc-v1">{step.description}</p>
                                    </li>
                                ))}
                            </ul>
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

export default V1App;
