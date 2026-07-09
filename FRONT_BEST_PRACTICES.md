# Porteria Front - Buenas practicas

## Arquitectura base

- React + Tailwind.
- Centralizar HTTP en `src/api/apiClient.ts`.
- Toda llamada API debe usar `apiClient` para backdrop global y JWT expirado.

## Patron por feature

```text
pages/MiFeaturePage.tsx
hooks/useMiFeature.ts
components/MiFeature/...
types/pages/mi-feature.types.ts
```

## Autenticacion

- Sesion via cookie HttpOnly (`porteria_access_token`); el JWT no se guarda en `localStorage`.
- Usuario y expiracion solo en memoria React; al recargar se rehidrata con `GET /auth/me`.
- Login: obtener clave publica (`GET /auth/public-key`), cifrar contrasena RSA-OAEP y `POST /auth/login` con `{ username, encryptedPassword }`.
- Todas las peticiones HTTP usan `credentials: 'include'` en `apiClient`.
- 401 / token expirado: logout, redirect `/login` y toast.
- Al iniciar la app se eliminan claves legacy de `localStorage` si existian.

## UI/UX

- Toast via `ToastContext`.
- Backdrop global en cada request HTTP.
- Modales con `useEscapeKey`.

## Documentacion en codigo

- Todo archivo `.ts`/`.tsx` de logica debe iniciar con cabecera `@file` y `@description` en espanol.
- Toda funcion, metodo, hook y helper interno debe tener JSDoc en espanol con `@param`, `@returns` y `@throws` cuando aplique.
- Props de componentes no obvias: JSDoc en la propiedad.
- Referencia de estilo: `src/api/apiClient.ts`.
