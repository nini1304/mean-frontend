# mean-frontend

mean-frontend es la aplicacion web del sistema veterinario MEAN. Permite operar los flujos de autenticacion, administracion de usuarios, gestion de pacientes y mascotas, veterinarios, agenda de citas e historial clinico desde una interfaz Angular.

Este repositorio corresponde al frontend del sistema y consume la API REST expuesta por `mean-backend`.

## Caracteristicas principales

- Login con JWT.
- Redireccion por rol: `ADMIN`, `RECEPCIONISTA` y `VETERINARIO`.
- Guards de autenticacion y autorizacion por rol.
- Interceptor HTTP para enviar `Authorization: Bearer <token>`.
- Menu administrativo.
- Gestion de usuarios y roles.
- Gestion de veterinarios y horarios.
- Gestion de pacientes, duenos y mascotas.
- Agenda de citas integrada con FullCalendar.
- Historial clinico por mascota.
- Registro y edicion de consultas, vacunas, desparasitaciones, procedimientos y examenes.
- Carga de adjuntos para examenes clinicos.
- Build de produccion preparado para servirse con Nginx.

## Stack tecnologico

- Angular 19
- TypeScript 5.7
- Angular Router
- Angular Forms
- HttpClient
- RxJS
- FullCalendar
- Karma y Jasmine
- Docker
- Nginx

## Arquitectura

```text
mean-frontend
|-- package.json
|-- angular.json
|-- proxy.conf.json
|-- Dockerfile
|-- nginx.conf
|-- public/                 # Assets publicos
`-- src/app/
    |-- admin/              # Menu y vistas administrativas
    |-- agenda/             # Calendario y citas
    |-- auth/               # Login y servicio de autenticacion
    |-- core/               # Interceptor y guards
    |-- historial/          # Historial clinico
    |-- pacientes/          # Gestion de pacientes y mascotas
    |-- recepcionista/      # Menu de recepcionista
    |-- usuarios/           # Gestion de usuarios
    `-- veterinario/        # Gestion y menu veterinario
```

## Relacion con el backend

El frontend usa rutas relativas `/api` para comunicarse con `mean-backend`.

En desarrollo, `proxy.conf.json` redirige:

```text
/api -> http://127.0.0.1:3000
```

Puertos esperados:

```text
Frontend: http://localhost:4200
Backend:  http://localhost:3000
```

## Requisitos previos

- Node.js 20 recomendado
- npm
- Angular CLI 19
- `mean-backend` ejecutandose en `http://localhost:3000`

## Instalacion

```bash
npm install
```

## Ejecucion local

```bash
npm start
```

La aplicacion queda disponible en:

```text
http://localhost:4200
```

El proxy de Angular permite consumir el backend sin configurar URLs absolutas en la mayoria de servicios.

Nota tecnica: el servicio de autenticacion usa una URL absoluta para cambio de contrasena (`http://localhost:3000/api/contrasenas/change-password`). Para despliegues fuera de local se recomienda mover esa llamada a ruta relativa `/api/contrasenas/change-password`, igual que el resto de servicios.

## Scripts disponibles

| Comando | Descripcion |
| --- | --- |
| `npm start` | Levanta el servidor de desarrollo de Angular |
| `npm run build` | Genera la version compilada en `dist/mean-frontend` |
| `npm run watch` | Compila en modo observacion para desarrollo |
| `npm test` | Ejecuta pruebas unitarias con Karma/Jasmine |

## Rutas principales

| Ruta | Acceso | Vista |
| --- | --- | --- |
| `/` | Publico | Login |
| `/admin/menu` | `ADMIN` | Menu administrativo |
| `/admin/usuarios` | `ADMIN` | Gestion de usuarios |
| `/admin/veterinarios` | `ADMIN` | Gestion de veterinarios |
| `/recepcionista/menu` | `RECEPCIONISTA` | Menu de recepcion |
| `/veterinario/menu` | `VETERINARIO` | Menu veterinario |
| `/pacientes` | `ADMIN`, `RECEPCIONISTA`, `VETERINARIO` | Listado y gestion de pacientes |
| `/historial/:idMascota` | Veterinario / flujo clinico | Historial clinico de mascota |
| `/agenda` | Agenda | Calendario de citas |

## Modulos funcionales

| Area | Funcionalidad |
| --- | --- |
| Autenticacion | Login, logout, recuperacion y cambio de contrasena |
| Seguridad | Guards por token y rol, interceptor JWT |
| Usuarios | Crear, editar y eliminar usuarios |
| Roles | Consulta de roles y roles sin perfil veterinario |
| Veterinarios | Alta, edicion, baja logica y horarios |
| Pacientes | Registro de duenos y mascotas |
| Agenda | Visualizacion, creacion, movimiento y estado de citas |
| Historial clinico | Consultas, vacunas, desparasitaciones, procedimientos y examenes |
| Adjuntos | Subida de archivos asociados a examenes |

## Build de produccion

```bash
npm run build
```

El resultado se genera en:

```text
dist/mean-frontend
```

## Docker

Construir imagen:

```bash
docker build -t mean-frontend .
```

Ejecutar contenedor:

```bash
docker run -p 8080:80 mean-frontend
```

La imagen usa Nginx para servir el build de Angular como SPA.

Para un despliegue completo en contenedores, Nginx o el gateway del entorno debe redirigir `/api` hacia `mean-backend`, ya que el `nginx.conf` actual solo sirve la aplicacion Angular.

## Pruebas

```bash
npm test
```

Angular ejecuta las pruebas unitarias configuradas con Karma y Jasmine.

## Orden sugerido de arranque

1. Levantar MongoDB.
2. Levantar MinIO si se usaran adjuntos.
3. Ejecutar `mean-backend` en `http://localhost:3000`.
4. Ejecutar `mean-frontend` en `http://localhost:4200`.
