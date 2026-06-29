# PorteriaFront

SPA React/Vite del módulo de Portería con autenticación LDAP.

## Requisitos

- Node.js 18+
- Backend `porteria_back` en ejecución

## Arranque

```bash
npm install
cp .env.example .env
npm run dev
```

Por defecto la app corre en `http://localhost:5173` y consume `http://localhost:1001/api/v1`.

## Rutas

- `/login` — autenticación LDAP
- `/porteria` — indicadores y operación de portería

## Documentación

- [Cómo se usa React en el proyecto](./REACT_EN_PORTERIA.md)
- [Buenas prácticas](./FRONT_BEST_PRACTICES.md)
