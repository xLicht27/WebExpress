import { test, expect } from '@jest/globals';

class Envio {
    constructor(tracking, destino) {
        if (!tracking) throw new Error("Tracking es requerido");
        this.tracking = tracking;
        this.destino = destino;
        this.estado = "En preparación";
    }

    actualizarEstado(nuevoEstado) {
        const estadosValidos = ["En preparación", "Despachado", "En camino", "Entregado"];
        if (!estadosValidos.includes(nuevoEstado)) {
            throw new Error("Estado no válido");
        }
        this.estado = nuevoEstado;
        return this.estado;
    }
}

test('Escenario 1: Crear un envío correctamente', () => {
    const envio = new Envio("WEB-123", "Lima");
    expect(envio.tracking).toBe("WEB-123");
    expect(envio.destino).toBe("Lima");
    expect(envio.estado).toBe("En preparación");
});

test('Escenario 2: Actualizar estado de envío', () => {
    const envio = new Envio("WEB-456", "Arequipa");
    const nuevoEstado = envio.actualizarEstado("Despachado");
    expect(nuevoEstado).toBe("Despachado");
});

test('Escenario 3: Intentar poner estado inválido (debe fallar)', () => {
    const envio = new Envio("WEB-789", "Cusco");
    expect(() => {
        envio.actualizarEstado("Estado inexistente");
    }).toThrow("Estado no válido");
});

test('Escenario 4: Crear envío sin tracking (debe fallar)', () => {
    expect(() => {
        new Envio("", "Lima");
    }).toThrow("Tracking es requerido");
});