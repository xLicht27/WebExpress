import { useState } from 'react';
import '../../App.css';

const MOCK_TRACKING_DATA = {
    'PK-98234710': {
        id: 'PK-98234710',
        status: 'En camino',
        badge: 'Tránsito prioritario',
        estimatedDelivery: 'Jueves, 24 Oct',
        origin: 'Callao, Perú',
        timeline: [
            { date: '22 Oct, 14:30', title: 'En tránsito', description: 'El paquete ha salido del centro de distribución regional.' },
            { date: '21 Oct, 09:15', title: 'En aduanas', description: 'Procesamiento de aduana completado.' },
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
        timeline: [
            { date: 'Ayer, 10:00', title: 'Retenido en almacén', description: 'Esperando pago de aranceles de importación.' },
            { date: '29 Jun, 15:00', title: 'En aduanas', description: 'Ingreso a aduana marítima.' },
            { date: '28 Jun, 08:00', title: 'Llegada a puerto', description: 'Ingreso a puerto del Callao.' }
        ]
    }
};

function V1App({ hideVersionLabel }) {
    const [activeTab, setActiveTab] = useState('rastrear');
    const [searchQuery, setSearchQuery] = useState('');
    const [trackingData, setTrackingData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

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

    const handleContactSubmit = (e) => {
        e.preventDefault();
        alert('Gracias por contactarnos. Tu mensaje ha sido recibido (Simulación V1).');
        e.target.reset();
    };

    return (
        <div className="pikkup-app version-v1">
            <header className="pikkup-header">
                <div className="header-container">
                    <div className="logo">Pikkup {!hideVersionLabel && <span className="version-label">V1</span>}</div>
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
                    </>
                )}

                {activeTab === 'ubicaciones' && (
                    <section className="locations-simple-section">
                        <h2>Nuestras Oficinas en Lima (V1)</h2>
                        <p className="section-desc">Detalle textual de nuestras sedes principales.</p>
                        <div className="locations-simple-list">
                            <div className="location-simple-card">
                                <h3>Sede Central Callao</h3>
                                <p><strong>Dirección:</strong> Av. Elmer Faucett 150, Callao</p>
                                <p><strong>Horario:</strong> Lunes a Viernes 8:00 AM - 6:00 PM | Sábados 9:00 AM - 1:00 PM</p>
                                <p><strong>Teléfono:</strong> (01) 511-2000</p>
                            </div>
                            <div className="location-simple-card">
                                <h3>Oficina San Isidro</h3>
                                <p><strong>Dirección:</strong> Av. Javier Prado Este 450, San Isidro</p>
                                <p><strong>Horario:</strong> Lunes a Viernes 8:30 AM - 6:30 PM | Sábados 9:00 AM - 1:00 PM</p>
                                <p><strong>Teléfono:</strong> (01) 422-3500</p>
                            </div>
                            <div className="location-simple-card">
                                <h3>Oficina Miraflores</h3>
                                <p><strong>Dirección:</strong> Calle Shell 310, Miraflores</p>
                                <p><strong>Horario:</strong> Lunes a Viernes 9:00 AM - 7:00 PM | Sábados 9:00 AM - 2:00 PM</p>
                                <p><strong>Teléfono:</strong> (01) 445-9000</p>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'support' && (
                    <section className="support-simple-section">
                        <h2>Atención al Cliente y Soporte (V1)</h2>
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

export default V1App;
