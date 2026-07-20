import { useState, useEffect } from 'react';
import BaseApp from './versions/base/App.jsx';
import V1App from './versions/v1/App.jsx';
import V2App from './versions/v2/App.jsx';
import V3App from './versions/v3/App.jsx';
import V4App from './versions/v4/App.jsx';
import './App.css';

function App() {
    // Check if '?sim=true' or '?evolution=true' is in the URL to activate simulator by default
    const queryParams = new URLSearchParams(window.location.search);
    const hasSimParam = queryParams.get('sim') === 'true' || queryParams.get('evolution') === 'true';
    
    const [isSimulatorActive, setIsSimulatorActive] = useState(hasSimParam);
    const [activeVersion, setActiveVersion] = useState('v4');

    // Setup key listener to toggle the simulator using Ctrl + Shift + S
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
                e.preventDefault();
                setIsSimulatorActive(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Standalone mode: Render clean final version (V4 Olva Pro) without the simulator header
    if (!isSimulatorActive) {
        return <V4App hideVersionLabel={true} />;
    }

    // Demo mode: Render version simulator header bar
    return (
        <div className="software-simulator-container">
            {/* Control Bar for Version Switcher */}
            <div className="version-control-bar">
                <div className="simulator-info">
                    <span className="simulator-title">⚙️ Simulador de Evolución de Software</span>
                    <span className="simulator-desc">Presiona <strong>Ctrl + Shift + S</strong> para ocultar/mostrar esta barra.</span>
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
                        🔍 V1 (Búsqueda)
                    </button>
                    <button 
                        className={`tab-btn ${activeVersion === 'v2' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('v2')}
                    >
                        🗺️ V2 (Mapa)
                    </button>
                    <button 
                        className={`tab-btn ${activeVersion === 'v3' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('v3')}
                    >
                        ⚡ V3 (Premium)
                    </button>
                    <button 
                        className={`tab-btn ${activeVersion === 'v4' ? 'active' : ''}`}
                        onClick={() => setActiveVersion('v4')}
                    >
                        🏆 V4 (Courier Pro)
                    </button>
                </div>
            </div>

            {/* Version Content */}
            <div className="version-content-area">
                {activeVersion === 'base' && <BaseApp hideVersionLabel={false} />}
                {activeVersion === 'v1' && <V1App hideVersionLabel={false} />}
                {activeVersion === 'v2' && <V2App hideVersionLabel={false} />}
                {activeVersion === 'v3' && <V3App hideVersionLabel={false} />}
                {activeVersion === 'v4' && <V4App hideVersionLabel={false} />}
            </div>
        </div>
    );
}

export default App;
