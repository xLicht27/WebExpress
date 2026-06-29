# Escenarios Mínimos de Prueba - WebExpress

## Pruebas Obligatorias (Pipeline CI)

| # | Escenario           | Qué prueba                    | Resultado esperado                |
|---|-----------          |---------------------          |                                   |
| 1 | Crear envío          | Registro de paquete          | Se crea con ID único              |
| 2 | Actualizar estado    | Cambiar estado del envío     | Estado se actualiza correctamente |
| 3 | Estado inválido      | Poner estado no permitido    | Lanza error                       |
| 4 | Datos vacíos         | Crear envío sin tracking     | Lanza error                       |
| 5 | Búsqueda de tracking | Consultar estado por ID      | Muestra información del envío     |
| 6 | Búsqueda inexistente | Consultar ID que no existe   | Error 404 "No encontrado"         |