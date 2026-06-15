# 🌿 Life's — Plataforma de Legado Digital

> *"Tu historia merece ser recordada para siempre."*

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite 4 |
| Estilos | SASS (arquitectura @use) |
| Routing | React Router DOM |
| Backend | Node.js + Express + TypeScript |
| Base de datos | MySQL |
| Auth | JWT + bcryptjs |

---

## Estructura del proyecto

```
lifesreact/
├── src/                          ← Frontend React
│   ├── assets/
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   └── PrivateRoute/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── pages/
│   │   ├── Landing/              ← Página principal pública
│   │   ├── Auth/                 ← Login, Register, ForgotPassword
│   │   ├── Feed/                 ← Feed de recuerdos
│   │   ├── Profile/              ← Perfil de usuario
│   │   ├── Timeline/             ← Línea del tiempo
│   │   ├── FamilyTree/           ← Árbol genealógico
│   │   ├── SafeBox/              ← Caja fuerte
│   │   ├── TimeCapsule/          ← Cápsulas del tiempo
│   │   ├── FarewellVideo/        ← Último tributo
│   │   ├── DigitalEcho/          ← Ecos del Pasado (IA)
│   │   ├── Postal/               ← Postales digitales
│   │   ├── Savings/              ← Ahorro forzoso
│   │   └── Settings/             ← Configuración
│   ├── services/
│   │   └── api.ts                ← Llamadas al backend
│   ├── styles/
│   │   ├── abstracts/
│   │   │   ├── _variables.scss
│   │   │   └── _mixins.scss
│   │   ├── base/
│   │   │   ├── _reset.scss
│   │   │   └── _typography.scss
│   │   ├── partials/             ← Un partial por página/sección
│   │   └── main.scss
│   ├── types/
│   │   └── index.ts              ← Interfaces TypeScript
│   └── App.tsx                   ← Rutas completas
│
└── backend/                      ← API REST Node.js
    ├── src/
    │   ├── config/
    │   │   └── db.ts             ← Conexión MySQL
    │   ├── controllers/
    │   │   └── auth.controller.ts
    │   ├── middleware/
    │   │   └── auth.middleware.ts
    │   └── routes/
    │       └── auth.routes.ts
    ├── database/
    │   └── schema.sql            ← Schema MySQL completo
    ├── .env.example
    └── package.json
```

---

## Módulos del proyecto

### 🏠 Landing Page (pública)
Página de presentación con hero animado, árbol genealógico visual, niveles de membresía, features y CTA.

### 🔐 Auth
- Login con email/contraseña
- Registro de usuario
- Recuperación de contraseña
- Sistema de niveles: Bronce → Plata → Oro → Oro 2 → Diamante → Triple Diamante

### 📸 Feed
Muro de recuerdos con privacidad por categorías (público, familia, amigo, pareja, seguidor, privado).

### 👤 Perfil
Perfil público/privado con avatar, portada, bio, estadísticas y feed propio.

### 📅 Línea del tiempo
Registro diario → resumen mensual automático → resumen anual → biografía completa.

### 🌿 Árbol Genealógico
Árbol visual interactivo con ascendencia y descendencia, pop-ups por persona, seguimiento geográfico del linaje.

### 🔒 Caja Fuerte
Resguardo de documentos, valores y crypto. Acceso con clave adicional.

### ⏰ Cápsulas del tiempo
Mensajes en video/texto programados para enviarse en una fecha futura a cualquier destinatario.

### 🎬 Último tributo
Grabación de video de despedida para personas o situaciones específicas (enfermedad terminal, etc.).

### 🤖 Ecos del Pasado
IA que, basada en los escritos y videos del usuario, permite a descendientes hacerle preguntas al "yo digital".

### 📮 Postal Digital
Convertir recuerdos en postales físicas con firma caligráfica, envío mundial y pago QR / Mercado Pago.

### 💰 Ahorro Forzoso
$1 a $100/mes, bloqueado 10 años, con rendimiento variable y testamento digital legal.

---

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `$primary` | `#03192e` | Fondo hero, nav, secciones oscuras |
| `$gold` | `#C9A84C` | Acentos, CTAs, niveles |
| `$cream` | `#fbf9f5` | Fondo general claro |
| `$mist` | `#4a6070` | Texto secundario |
| `$text-dark` | `#1b1c1a` | Texto principal |

## Tipografía

- **Display:** Newsreader (serif) — títulos e identidad de marca
- **Body:** Manrope (sans-serif) — cuerpo, UI, botones

---

## Comandos

### Frontend
```bash
cd lifesreact
npm run dev      # Desarrollo en localhost:5173
npm run build    # Build de producción
```

### Backend
```bash
cd lifesreact/backend
cp .env.example .env   # Configurar variables
npm install
npm run dev            # Desarrollo en localhost:3001
```

### Base de datos
```sql
-- Importar el schema
mysql -u root -p < backend/database/schema.sql
```

---

## Variables de entorno

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
```

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=lifes_db
JWT_SECRET=tu_secret_key
```
