import '../../App.css';

function BaseApp() {
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        alert('Esta versión de la aplicación (Código Base) no incluye funcionalidad de búsqueda dinámica. Por favor, selecciona la Versión 1 o superior para interactuar con el sistema.');
    };

    return (
        <div className="pikkup-app version-base">
            <header className="pikkup-header">
                <div className="header-container">
                    <div className="logo">Pikkup <span className="version-label">Base</span></div>
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

                    <form className="search-form" onSubmit={handleSearchSubmit}>
                        <div className="input-group">
                            <label className="input-label">Número de seguimiento</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    placeholder="Ej: PK-98234710"
                                    className="search-input"
                                    required
                                    disabled
                                />
                                <button type="submit" className="btn-search">
                                    Buscar
                                </button>
                            </div>
                            <span className="helper-text">* La barra de búsqueda está deshabilitada en el Código Base estático.</span>
                        </div>
                    </form>
                </section>
                
                <section className="placeholder-info-section">
                    <div className="info-placeholder-card">
                        <h3>Módulo de Rápida Visualización</h3>
                        <p>Los mapas y detalles del historial de envío se integrarán en versiones posteriores del software.</p>
                    </div>
                </section>
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

export default BaseApp;
