import { useState } from 'react';
import BaseApp from './versions/base/App.jsx';
import V1App from './versions/v1/App.jsx';
import V2App from './versions/v2/App.jsx';
import V3App from './versions/v3/App.jsx';
import './App.css';

function App() {
    const [activeVersion, setActiveVersion] = useState('v3');

    return (
        <div className="software-simulator-container">
            {/* Control Bar for Version Switcher */}
            <div className="version-control-bar">
                <div className="simulator-info">
                    <span className="simulator-title">⚙️ Simulador de Evolución de Software</span>
                    <span className="simulator-desc">Visualiza cómo cambia el código del proyecto WebExpress a través del tiempo.</span>
                </div>
                <div className="version-tabs">
                    <button 
                        className={`tab-btn ${activeVersion === 'base' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('base')}
                    >
                        📁 Código Base
                    </button>
                    <button 
                        className={`tab-btn ${activeVersion === 'v1' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('v1')}
                    >
                        🔍 Versión 1 (Búsqueda)
                    </button>
                    <button 
                        className={`tab-btn ${activeVersion === 'v2' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('v2')}
                    >
                        🗺️ Versión 2 (Mapa)
                    </button>
                    <button 
                        className={`tab-btn ${activeVersion === 'v3' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('v3')}
                    >
                        ⚡ Versión 3 (Premium)
                    </button>
                </div>
            </div>

            {/* Version Content */}
            <div className="version-content-area">
                {activeVersion === 'base' && <BaseApp />}
                {activeVersion === 'v1' && <V1App />}
                {activeVersion === 'v2' && <V2App />}
                {activeVersion === 'v3' && <V3App />}
            </div>
        </div>
    );
}

export default App;
