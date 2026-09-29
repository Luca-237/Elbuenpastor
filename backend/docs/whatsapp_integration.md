# 📱 Guía de Integración — WhatsApp Business Cloud API (Meta)
### El Buen Pastor · Ceras & Artículos Sagrados

> **Versión de API:** Meta Graph API `v19.0`  
> **Arquitectura:** Webhook bidireccional en Node.js/Express + Enlaces directos preformateados en React Frontend + API Cloud Oficial de Meta.

---

## 📋 Tabla de Contenidos

1. [Visión General de la Integración](#1-visión-general-de-la-integración)
2. [Componentes Implementados](#2-componentes-implementados)
   - [Frontend (Acceso directo para clientes)](#frontend-acceso-directo-para-clientes)
   - [Backend (Webhooks y mensajería automatizada)](#backend-webhooks-y-mensajería-automatizada)
3. [Guía Paso a Paso: Configuración en Meta for Developers](#3-guía-paso-a-paso-configuración-en-meta-for-developers)
   - [Paso 1: Crear la App en Meta](#paso-1-crear-la-app-en-meta)
   - [Paso 2: Obtener Phone Number ID y WABA ID](#paso-2-obtener-phone-number-id-y-waba-id)
   - [Paso 3: Generar Token Permanente (System User)](#paso-3-generar-token-permanente-system-user)
   - [Paso 4: Configurar el Webhook](#paso-4-configurar-el-webhook)
4. [Variables de Entorno (`.env`)](#4-variables-de-entorno-env)
5. [Endpoints de la API](#5-endpoints-de-la-api)
6. [Plantillas Oficiales de WhatsApp (Templates)](#6-plantillas-oficiales-de-whatsapp-templates)
7. [Pruebas y Diagnóstico](#7-pruebas-y-diagnóstico)

---

## 1. Visión General de la Integración

La integración combina dos canales complementarios para una experiencia fluida:

1. **Canal Directo Cliente ➔ Taller (Client-Side wa.me):**
   - El cliente puede iniciar consultas desde cualquier vista mediante el **botón flotante litúrgico**.
   - En el **Formulario de Contacto**, puede enviar los datos completados directamente a WhatsApp con un solo clic.
   - En el **Carrito de Compras (Sidebar Drawer)**, puede pulsar **«Enviar Pedido vía WhatsApp»** para enviar el desglose exacto de velas, cantidades, tamaños, precios mayoristas y total calculado al maestro de taller.

2. **Canal Automatizado Backend ➔ Cliente (Meta Cloud API):**
   - Webhook para recibir mensajes entrantes de clientes.
   - Auto-respuesta litúrgica con información de catálogo y consulta de pedidos.
   - Notificaciones automáticas de cambio de estado de pedidos (`En Preparación`, `Listo / Embalado`, `En Camino`, `Entregado`).

---

## 2. Componentes Implementados

### Frontend (Acceso directo para clientes)

- [`frontend/src/utils/whatsappHelper.js`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/frontend/src/utils/whatsappHelper.js):
  - Formatea URLs universales `https://wa.me/5491140008800?text=...`.
  - Generador de mensaje de consulta general (`buildGeneralInquiryMessage`).
  - Generador de mensaje de formulario de contacto (`buildContactFormMessage`).
  - Generador de pedido formal con desglose de ítems (`buildOrderWhatsAppMessage`).
- [`frontend/src/components/FloatingWhatsApp.jsx`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/frontend/src/components/FloatingWhatsApp.jsx):
  - Botón flotante accesible en todas las vistas con tooltip suave y SVG oficial de WhatsApp.
- [`frontend/src/components/ContactoSection.jsx`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/frontend/src/components/ContactoSection.jsx):
  - Tarjeta de WhatsApp interactiva (`Abrir Chat en WhatsApp →`).
  - Botón «Consultar por WhatsApp» integrado en el formulario.
- [`frontend/src/components/SidebarCart.jsx`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/frontend/src/components/SidebarCart.jsx):
  - Botón «Enviar Pedido vía WhatsApp» para formalizar la cotización al instante.

### Backend (Webhooks y mensajería automatizada)

- [`backend/src/config/whatsapp.js`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/backend/src/config/whatsapp.js):
  - Lectura de variables de entorno, headers y estado de conexión.
- [`backend/src/services/whatsappService.js`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/backend/src/services/whatsappService.js):
  - Normalización de números telefónicos (E.164 Argentina `+54 9 ...`).
  - Envío de texto y plantillas oficiales a través de Meta Graph API.
  - Notificaciones de pedido para clientes y administradores.
  - Auto-respuestas inteligentes ante consultas de catálogo y estado.
- [`backend/src/controllers/whatsappController.js`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/backend/src/controllers/whatsappController.js):
  - Validación de handshake de Meta (`hub.mode` y `hub.verify_token`).
  - Procesamiento de eventos entrantes (`messages`, `statuses`).
- [`backend/src/routes/whatsappRoutes.js`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/backend/src/routes/whatsappRoutes.js):
  - Montaje de rutas `/api/whatsapp`.

---

## 3. Guía Paso a Paso: Configuración en Meta for Developers

### Paso 1: Crear la App en Meta

1. Ingresar a [Meta for Developers](https://developers.facebook.com/).
2. Ir a **Mis Apps** ➔ **Crear App**.
3. Seleccionar tipo de aplicación: **Empresa** (Business).
4. Asignar un nombre: `El Buen Pastor Litúrgico`.
5. En el panel de control de la app, buscar el producto **WhatsApp** y hacer clic en **Configurar**.

### Paso 2: Obtener Phone Number ID y WABA ID

1. En el menú lateral, ir a **WhatsApp** ➔ **Primeros pasos** (API Setup).
2. Meta te proporcionará:
   - **ID de número de teléfono (Phone Number ID):** Copiar este valor a `WHATSAPP_PHONE_NUMBER_ID` en tu archivo `.env`.
   - **ID de la cuenta de WhatsApp Business (WABA ID):** Copiar este valor a `WHATSAPP_BUSINESS_ACCOUNT_ID`.
   - **Número de prueba temporal:** Permite realizar pruebas inmediatas enviando mensajes a hasta 5 números registrados.
3. Para producción, ve a **WhatsApp** ➔ **Configuración** y asocia el número real de tu taller (+54 9 11 4000-8800).

### Paso 3: Generar Token Permanente (System User)

El token temporal de la pantalla de prueba dura solo 24 horas. Para producción se debe crear un **Usuario del Sistema**:

1. Ingresar a [Meta Business Manager](https://business.facebook.com/settings).
2. Ir a **Usuarios** ➔ **Usuarios del sistema** ➔ **Agregar**.
3. Asignar nombre `bot-el-buen-pastor` y rol `Empleado` o `Administrador`.
4. Hacer clic en **Asignar activos**:
   - Asignar la App creada con control total.
   - Asignar la Cuenta de WhatsApp Business con permiso de gestionar y enviar mensajes.
5. Hacer clic en **Generar nuevo token**:
   - Seleccionar la App creada.
   - Duración del token: **Nunca expira** (Never).
   - Marcar los permisos obligatorios:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
6. Copiar el token generado y pegarlo en `WHATSAPP_API_TOKEN` en `backend/.env`.

### Paso 4: Configurar el Webhook

1. En Meta for Developers, ve a **WhatsApp** ➔ **Configuración** ➔ **Webhook**.
2. Hacer clic en **Editar**:
   - **URL de devolución de llamada (Callback URL):**
     - En desarrollo local: usar una herramienta como ngrok:
       ```bash
       ngrok http 5000
       ```
       URL resultante: `https://xxxx.ngrok-free.app/api/whatsapp/webhook`
     - En producción: `https://api.tudominio.com/api/whatsapp/webhook`
   - **Identificador de verificación (Verify Token):**
     - Ingresar el mismo token definido en tu `.env`: `ElBuenPastor_WA_VerifyToken_2026`
3. Hacer clic en **Verificar y Guardar**.
4. En la sección **Campos del Webhook**, suscribirse al evento:
   - ✅ `messages`

---

## 4. Variables de Entorno (`.env`)

En [`backend/.env`](file:///c:/Users/lucam/OneDrive/Desktop/ElBuenPastor/Elbuenpastor/backend/.env):

```env
# =============================================
# CONFIGURACIÓN WHATSAPP BUSINESS CLOUD API (META)
# =============================================
WHATSAPP_API_VERSION=v19.0
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=tu_waba_id_aqui
WHATSAPP_API_TOKEN=EAA...tu_system_user_token_aqui...
WHATSAPP_VERIFY_TOKEN=ElBuenPastor_WA_VerifyToken_2026
WHATSAPP_ADMIN_PHONE=5491140008800
WHATSAPP_ENABLE_AUTO_REPLY=true
```

> **Nota:** Si `WHATSAPP_PHONE_NUMBER_ID` o `WHATSAPP_API_TOKEN` están vacíos, el backend funcionará en **Modo Simulación** seguro (imprime los mensajes en consola sin fallar).

---

## 5. Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/whatsapp/status` | Verifica el estado de configuración de las credenciales |
| `GET` | `/api/whatsapp/webhook` | Handshake de verificación de Meta (challenge) |
| `POST` | `/api/whatsapp/webhook` | Recepción de mensajes y eventos entrantes |
| `POST` | `/api/whatsapp/send-message` | Envío manual de mensaje de texto a un cliente |
| `POST` | `/api/whatsapp/notify-order` | Disparo de notificación de estado de pedido |
| `GET` | `/api/health` | Healthcheck general del servidor |

---

## 6. Plantillas Oficiales de WhatsApp (Templates)

Para iniciar conversaciones con clientes fuera de la ventana de 24 horas (por ejemplo, notificar cuando un pedido esté listo semanas después), se deben dar de alta plantillas en el Administrador de WhatsApp:

### Plantilla: `confirmacion_pedido_liturgico`
- **Categoría:** Utilidad (Utility)
- **Idioma:** Español (Argentina / General)
- **Texto:**
  > ¡Paz y bien, {{1}}! Hemos recibido tu solicitud de pedido litúrgico *{{2}}* en El Buen Pastor. En breve un maestro de taller coordinará la colada artesanal y el despacho. Puedes consultar el estado en cualquier momento respondiendo a este mensaje.

### Plantilla: `actualizacion_estado_pedido`
- **Categoría:** Utilidad (Utility)
- **Idioma:** Español (Argentina / General)
- **Texto:**
  > Estimado/a {{1}}, tu pedido *{{2}}* ha cambiado de estado: *{{3}}*. Fecha estimada de entrega: {{4}}. Taller El Buen Pastor.

---

## 7. Pruebas y Diagnóstico

### Diagnóstico de Estado
```bash
curl http://localhost:5000/api/whatsapp/status
```

### Probar el Handshake del Webhook
```bash
curl "http://localhost:5000/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=12345&hub.verify_token=ElBuenPastor_WA_VerifyToken_2026"
```
*Debe responder:* `12345`

### Enviar Mensaje de Prueba
```bash
curl -X POST http://localhost:5000/api/whatsapp/send-message \
  -H "Content-Type: application/json" \
  -d '{"to": "5491140008800", "message": "¡Paz y bien! Prueba del taller litúrgico."}'
```
