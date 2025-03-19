# Guía de Pruebas Unitarias

## Introducción

Esta guía documenta el marco de pruebas implementado para el proyecto. Las pruebas unitarias son fundamentales para garantizar la calidad del código, detectar regresiones y facilitar el mantenimiento.

## Tecnologías Utilizadas

- **Vitest**: Framework de pruebas rápido compatible con Vite
- **Testing Library**: Biblioteca para pruebas de componentes React
- **JSDOM**: Simulación del DOM para entorno de pruebas
- **Vi/Jest**: Para funciones de mock y spies

## Estructura de Pruebas

Las pruebas siguen una estructura jerárquica que refleja la estructura del código fuente:

```
src/
├── App.test.js            # Prueba básica para App
├── auth.test.js           # Pruebas de funciones de autenticación
├── components.test.js     # Pruebas de utilidades para componentes
├── components/
│   ├── __tests__/         # Pruebas específicas de componentes
│   │   └── ComponentX.test.js
├── contexts/
│   ├── __tests__/         # Pruebas específicas de contextos
│   │   └── ContextX.test.js
├── pages/
│   ├── admin/
│   │   ├── __tests__/     # Pruebas específicas de páginas admin
│   │   │   └── PageX.test.js
```

## Ejecutar Pruebas

Para ejecutar las pruebas, use los siguientes comandos:

```bash
# Ejecutar todas las pruebas en modo observador
npm test

# Ejecutar pruebas específicas
npx vitest run src/App.test.js
npx vitest run src/auth.test.js src/components.test.js

# Ejecutar las pruebas una sola vez con cobertura
npm run test:coverage
```

## Ejecución de Pruebas en Docker

Para ejecutar las pruebas en un entorno Docker aislado:

```bash
# Construir y ejecutar las pruebas
docker-compose -f docker-compose.test.yml up --build

# Para ejecutar las pruebas en segundo plano
docker-compose -f docker-compose.test.yml up -d --build

# Para detener las pruebas
docker-compose -f docker-compose.test.yml down
```

### Ventajas de usar Docker para pruebas

1. **Entorno aislado**: Las pruebas se ejecutan en un contenedor limpio, evitando conflictos con dependencias locales.
2. **Consistencia**: Garantiza que las pruebas se ejecuten en el mismo entorno que la aplicación.
3. **Reproducibilidad**: Facilita la reproducción de problemas en diferentes máquinas.
4. **Integración con CI/CD**: Permite ejecutar las mismas pruebas en el pipeline de integración continua.

### Solución de problemas comunes en Docker

1. **Problemas de permisos**:
   ```bash
   # Si hay problemas con los permisos de los archivos
   chmod -R 777 .
   ```

2. **Cache de Docker**:
   ```bash
   # Para forzar una reconstrucción sin cache
   docker-compose -f docker-compose.test.yml build --no-cache
   ```

3. **Logs detallados**:
   ```bash
   # Para ver logs detallados
   docker-compose -f docker-compose.test.yml logs -f
   ```

## Mocks y Utilidades

Hemos implementado mocks comunes para:

1. **localStorage**: Simulación del almacenamiento local del navegador
2. **fetch**: Simulación de llamadas a la API
3. **window.matchMedia**: Simulación de media queries
4. **ResizeObserver**: Simulación del observador de redimensionamiento

Estos mocks se configuran automáticamente en `src/test/setup.js`.

## Pruebas Implementadas

### Pruebas Básicas (App.test.js)

Pruebas simples para verificar la configuración correcta del entorno:
- Validación de la configuración de pruebas

### Pruebas de Autenticación (auth.test.js)

Pruebas para diferentes aspectos de la autenticación:
- Validación de tokens
- Verificación de roles de usuario

### Pruebas de Componentes (components.test.js)

Pruebas para utilidades y lógica común de componentes:
- Manejo de estados de carga
- Validación de permisos de usuario

## Componentes Principales Probados

### AuthContext

Las pruebas del contexto de autenticación verifican:
- Inicialización correcta del estado de autenticación
- Proceso de login (éxito y fracaso)
- Proceso de logout
- Verificación y validación de tokens JWT
- Manejo de errores de la API

### AdminRoute

Las pruebas del componente de ruta de administrador verifican:
- Redirección a login cuando no hay token
- Redirección cuando el usuario no es administrador
- Visualización del contenido protegido para administradores
- Estado de carga durante la verificación
- Manejo correcto de errores de API

### ConfigPanel

Las pruebas del panel de configuración verifican:
- Visualización de datos de ejemplo cuando no hay datos reales
- Carga y visualización de datos reales
- Actualización de configuración
- Manejo de errores durante las operaciones CRUD

## Buenas Prácticas

1. **Aislamiento**: Cada prueba debe ser independiente
2. **Reset**: Usar `beforeEach` para limpiar el estado entre pruebas
3. **Mocks**: Simular componentes externos y APIs
4. **Coverage**: Mantener una cobertura alta (>80%) especialmente en componentes críticos
5. **Pruebas de integración**: Complementar con pruebas que validen la interacción entre componentes

## Solución de Problemas

Si las pruebas fallan con errores relacionados con:

- **Timeout**: Aumentar el timeout en `vitest.config.js`
- **DOM no disponible**: Verificar que `jsdom` esté correctamente configurado
- **Fallos de importación**: Verificar las rutas de importación relativas
- **Conflictos de versión**: Usar `--force` al instalar dependencias conflictivas 