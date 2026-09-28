# 📦 Estructura de la Base de Datos — El Buen Pastor

> **Motor:** MongoDB Atlas  
> **ODM:** Mongoose  
> **Nombre de la DB:** `ElBuenPastor`  
> **Conexión:** definida en `src/config/database.js` vía variable de entorno `MONGO_URI`

---

## Tabla de contenidos

1. [Visión general](#visión-general)
2. [Diagrama de relaciones](#diagrama-de-relaciones)
3. [Colecciones](#colecciones)
   - [categorias_cliente](#1-categorias_cliente)
   - [clientes](#2-clientes)
   - [tamanos](#3-tamanos)
   - [modelos_vela](#4-modelos_vela)
   - [productos](#5-productos-skus)
   - [pedidos](#6-pedidos)
4. [Patrones de diseño utilizados](#patrones-de-diseño-utilizados)
5. [Índices definidos](#índices-definidos)

---

## Visión general

La base de datos modela un sistema de gestión de pedidos para una fábrica de velas artesanales. El catálogo se organiza en dos niveles:

- **ModeloVela** → el diseño base (ej: "Cilíndrica Soja")
- **Producto (SKU)** → la variante concreta = Modelo + Tamaño (ej: "Cilíndrica Soja Grande")

Los pedidos guardan **snapshots** de los datos al momento de la compra para preservar la integridad histórica del registro contable.

---

## Diagrama de relaciones

```
CategoriaCliente <──────────────── Cliente
                                      │
                                      │ (ref)
                                      ▼
Tamano ──────────────────────────► Producto (SKU)
                                      │
ModeloVela ──────────────────────────>│ (ref + caché parcial)
                                      │
                                      │ snapshot embebido
                                      ▼
                                   Pedido
                                      │
                             ┌────────┴────────┐
                             │                 │
                         items[]         direccionEntrega
                       (snapshot)          (snapshot)
```

> **Referencia** = ObjectId que apunta al documento en otra colección.  
> **Snapshot embebido** = copia de los datos al momento de la operación, no se actualiza si el original cambia.

---

## Colecciones

### 1. `categorias_cliente`

**Modelo:** `CategoriaCliente` · **Archivo:** `src/models/CategoriaCliente.js`

Tabla de configuración de negocio. Define los grupos de clientes y sus condiciones comerciales. Se referencia desde `clientes` para que un cambio de descuento se propague a todos los clientes de la categoría.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | auto | Identificador único |
| `nombre` | String | ✅ | Valor fijo: `Consumidor Final`, `Mayorista`, `Distribuidor`, `Empleado` |
| `descripcion` | String | ❌ | Descripción libre de la categoría |
| `descuentoPorcentaje` | Number | ❌ | Descuento base (0–100). Default: `0` |
| `cantidadMinimaAcceso` | Number | ❌ | Unidades mínimas por pedido para acceder a esta categoría. Default: `1` |
| `activa` | Boolean | ❌ | Habilita/deshabilita la categoría. Default: `true` |
| `createdAt` | Date | auto | Timestamp de creación |
| `updatedAt` | Date | auto | Timestamp de última modificación |

---

### 2. `clientes`

**Modelo:** `Cliente` · **Archivo:** `src/models/Cliente.js`

Registro maestro de clientes. La dirección se **embebe** (no tiene sentido fuera del cliente); la categoría se **referencia** (es compartida y configurable).

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | auto | Identificador único |
| `nombre` | String | ✅ | Nombre del cliente |
| `apellido` | String | ❌ | Apellido |
| `email` | String | ✅ | Email único (formato validado, lowercase) |
| `telefono` | String | ❌ | Teléfono de contacto |
| `cuit` | String | ❌ | CUIT (índice sparse: permite múltiples `null`) |
| `direccion` | Objeto embebido | ❌ | Ver sub-esquema **Dirección** abajo |
| `categoria` | ObjectId → `CategoriaCliente` | ✅ | Referencia a la categoría comercial |
| `activo` | Boolean | ❌ | Default: `true` |
| `notas` | String | ❌ | Observaciones internas |
| `createdAt` | Date | auto | Timestamp de creación |
| `updatedAt` | Date | auto | Timestamp de última modificación |

#### Sub-esquema embebido: Dirección (`_id: false`)

| Campo | Tipo | Requerido |
|---|---|---|
| `calle` | String | ❌ |
| `numero` | String | ❌ |
| `piso` | String | ❌ |
| `ciudad` | String | ✅ |
| `provincia` | String | ✅ |
| `codigoPostal` | String | ❌ |
| `pais` | String | ❌ — Default: `"Argentina"` |

**Índices:**
- Texto en `nombre`, `apellido`, `email` (búsqueda full-text)
- `{ categoria: 1 }`
- `{ activo: 1 }`
- `{ cuit: 1 }` sparse

---

### 3. `tamanos`

**Modelo:** `Tamano` · **Archivo:** `src/models/Tamano.js`

Tabla de lookup estandarizada de tamaños de vela. Se referencia desde `productos`. El nombre también se cachea en `productos.tamanoNombre` para evitar populate en listados.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | auto | Identificador único |
| `nombre` | String | ✅ | Nombre único. Ej: `"Chica"`, `"Grande"`, `"500g"` |
| `descripcion` | String | ❌ | Descripción libre |
| `pesoGramos` | Number | ❌ | Peso en gramos (para cálculo de envío) |
| `alturaCm` | Number | ❌ | Altura en centímetros |
| `diametroCm` | Number | ❌ | Diámetro en centímetros |
| `duracionHoras` | Number | ❌ | Tiempo de combustión estimado en horas |
| `activo` | Boolean | ❌ | Default: `true` |
| `createdAt` | Date | auto | Timestamp de creación |
| `updatedAt` | Date | auto | Timestamp de última modificación |

---

### 4. `modelos_vela`

**Modelo:** `ModeloVela` · **Archivo:** `src/models/ModeloVela.js`

El "diseño base" de una vela. Agrupa múltiples SKUs (variantes). Las variantes **no** se embedden aquí; son documentos independientes en `productos` que referencian este modelo.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | auto | Identificador único |
| `nombre` | String | ✅ | Nombre único. Ej: `"Cilíndrica"`, `"Votiva"` |
| `descripcion` | String | ❌ | Descripción del modelo |
| `tipoCera` | String (enum) | ✅ | `soja`, `parafina`, `abeja`, `gel`, `soja_parafina`, `otro` |
| `aromas` | `[String]` | ❌ | Lista de aromas disponibles para este modelo |
| `imagenes` | `[Objeto]` | ❌ | Ver sub-esquema **Imagen** abajo |
| `slug` | String | ❌ | URL amigable (auto-generado desde `nombre`, único, lowercase) |
| `activo` | Boolean | ❌ | Default: `true` |
| `ordenCatalogo` | Number | ❌ | Orden de presentación. Default: `0` |
| `createdAt` | Date | auto | Timestamp de creación |
| `updatedAt` | Date | auto | Timestamp de última modificación |

#### Sub-esquema embebido: Imagen (`_id: false`)

| Campo | Tipo | Descripción |
|---|---|---|
| `url` | String ✅ | URL de la imagen |
| `alt` | String | Texto alternativo. Default: `""` |
| `esPrincipal` | Boolean | Indica si es la imagen principal. Default: `false` |

**Índices:**
- Texto en `nombre`, `descripcion`, `aromas`
- `{ tipoCera: 1, activo: 1 }`

**Hooks:** `pre('save')` — genera el `slug` automáticamente desde el `nombre` (normaliza tildes, espacios → guiones).

---

### 5. `productos` (SKUs)

**Modelo:** `Producto` · **Archivo:** `src/models/Producto.js`

La unidad de venta concreta: la combinación única de `ModeloVela` + `Tamano`. Es el elemento que se agrega al carrito, tiene stock propio y precios por volumen embebidos.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | auto | Identificador único |
| `modelo` | ObjectId → `ModeloVela` | ✅ | Referencia al modelo base |
| `tamano` | ObjectId → `Tamano` | ✅ | Referencia al tamaño |
| `modeloNombre` | String | ✅ | **Caché** del nombre del modelo (Extended Reference Pattern) |
| `tamanoNombre` | String | ✅ | **Caché** del nombre del tamaño |
| `sku` | String | ✅ | Código único. Formato sugerido: `VEL-CIL-GRD-001` (uppercase) |
| `slug` | String | ❌ | URL amigable única (lowercase) |
| `preciosPorVolumen` | `[TramoPrecio]` | ✅ | Ver sub-esquema abajo. Mínimo 1 tramo |
| `stock` | Number | ✅ | Unidades en stock. Default: `0` |
| `stockMinimo` | Number | ❌ | Umbral de alerta de stock bajo. Default: `5` |
| `imagenes` | `[ImagenProducto]` | ❌ | Imágenes específicas de esta variante |
| `aroma` | String | ❌ | Aroma específico seleccionado para este SKU |
| `activo` | Boolean | ❌ | Default: `true` |
| `destacado` | Boolean | ❌ | Para destacar en catálogo. Default: `false` |
| `createdAt` | Date | auto | Timestamp de creación |
| `updatedAt` | Date | auto | Timestamp de última modificación |

#### Sub-esquema embebido: TramoPrecio (`_id: false`)

Define precios escalonados según la cantidad comprada.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `cantidadMinima` | Number | ✅ | Cantidad mínima del tramo (>= 1) |
| `cantidadMaxima` | Number | ❌ | Cantidad máxima (`null` = sin límite) |
| `precio` | Number | ✅ | Precio por unidad en este tramo |

**Ejemplo de `preciosPorVolumen`:**
```json
[
  { "cantidadMinima": 1,  "cantidadMaxima": 9,    "precio": 500 },
  { "cantidadMinima": 10, "cantidadMaxima": 49,   "precio": 450 },
  { "cantidadMinima": 50, "cantidadMaxima": null, "precio": 400 }
]
```

**Índices:**
- `{ modelo: 1, tamano: 1 }` único (no puede existir el mismo SKU dos veces)
- `{ activo: 1, destacado: 1 }`
- `{ stock: 1 }` (alertas de stock bajo)
- Texto en `modeloNombre`, `tamanoNombre`, `aroma`

**Métodos:**
- `getPrecioPorCantidad(cantidad)` → devuelve el precio unitario correspondiente al tramo de la cantidad indicada.

---

### 6. `pedidos`

**Modelo:** `Pedido` · **Archivo:** `src/models/Pedido.js`

Registro de cada transacción. Los ítems y la dirección de entrega se guardan como **snapshots embebidos** para preservar la integridad contable e histórica.

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `_id` | ObjectId | auto | Identificador único |
| `numeroPedido` | String | auto | Código legible único. Formato: `PED-YYYYMMDD-XXXX` |
| `cliente` | ObjectId → `Cliente` | ✅ | Referencia al cliente |
| `clienteNombre` | String | ✅ | **Caché** del nombre del cliente para listados rápidos |
| `estado` | String (enum) | ✅ | Ver ciclo de vida abajo. Default: `pendiente` |
| `items` | `[ItemPedido]` | ✅ | Snapshot de los productos comprados (mínimo 1) |
| `direccionEntrega` | Objeto embebido | ❌ | Snapshot de la dirección al momento del pedido |
| `subtotal` | Number | ✅ | Suma de `item.subtotal` (sin descuentos ni envío) |
| `descuentoPorcentaje` | Number | ❌ | % de descuento aplicado. Default: `0` |
| `descuentoMonto` | Number | ❌ | Monto de descuento calculado. Default: `0` |
| `costoEnvio` | Number | ❌ | Costo del envío. Default: `0` |
| `total` | Number | ✅ | `subtotal - descuentoMonto + costoEnvio` |
| `metodoPago` | String (enum) | ❌ | `efectivo`, `transferencia`, `mercadopago`, `tarjeta`, `cuenta_corriente` |
| `estadoPago` | String (enum) | ❌ | `pendiente`, `parcial`, `pagado`, `reembolsado`. Default: `pendiente` |
| `tipoEntrega` | String (enum) | ❌ | `retiro_local`, `envio_domicilio`. Default: `retiro_local` |
| `fechaEntregaEstimada` | Date | ❌ | Fecha estimada de entrega/retiro |
| `fechaEntregaReal` | Date | ❌ | Fecha real de entrega |
| `notas` | String | ❌ | Observaciones del pedido |
| `createdAt` | Date | auto | Timestamp de creación |
| `updatedAt` | Date | auto | Timestamp de última modificación |

#### Ciclo de vida del campo `estado`

```
borrador --> pendiente --> confirmado --> en_preparacion --> listo --> enviado --> entregado
                                                                              \
                                                                           cancelado
```

#### Sub-esquema embebido: ItemPedido (snapshot, `_id: false`)

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `productoId` | ObjectId → `Producto` | ❌ | Referencia débil (puede ser `null` si el producto fue eliminado) |
| `sku` | String | ✅ | SKU al momento del pedido |
| `modeloNombre` | String | ✅ | Nombre del modelo al momento del pedido |
| `tamanoNombre` | String | ✅ | Nombre del tamaño al momento del pedido |
| `aroma` | String | ❌ | Aroma seleccionado. Default: `null` |
| `cantidad` | Number | ✅ | Unidades compradas (>= 1) |
| `precioUnitario` | Number | ✅ | Precio por unidad al momento del pedido |
| `subtotal` | Number | ✅ | `cantidad x precioUnitario` |

#### Sub-esquema embebido: DireccionEntrega (snapshot, `_id: false`)

Mismos campos que la dirección de `clientes`: `calle`, `numero`, `piso`, `ciudad` ✅, `provincia` ✅, `codigoPostal`, `pais` (default `"Argentina"`).

**Índices:**
- `{ cliente: 1, createdAt: -1 }` (historial por cliente)
- `{ estado: 1, createdAt: -1 }` (panel de administración)
- `{ estadoPago: 1 }`

**Hooks:** `pre('save')` — auto-genera `numeroPedido` si no está definido.

---

## Patrones de diseño utilizados

| Patrón | Dónde se aplica | Razón |
|---|---|---|
| **Documento embebido** | `Cliente.direccion` | Datos exclusivos del padre, nunca consultados solos |
| **Referencia simple** | `Cliente → CategoriaCliente` | Entidad compartida: cambiar descuento afecta a todos |
| **Extended Reference (Referencia + Caché)** | `Producto.modeloNombre`, `Producto.tamanoNombre` | Evita populate en listados de catálogo |
| **Snapshot embebido** | `Pedido.items`, `Pedido.direccionEntrega` | Inmutabilidad histórica: protege contabilidad y auditoría |
| **Referencia débil** | `ItemPedido.productoId` | Navegación al SKU original si aún existe, sin depender de él |
| **Precios por volumen embebidos** | `Producto.preciosPorVolumen` | Acceso siempre conjunto, tamaño fijo y pequeño |

---

## Índices definidos

| Colección | Campos | Tipo | Propósito |
|---|---|---|---|
| `clientes` | `nombre`, `apellido`, `email` | text | Búsqueda full-text |
| `clientes` | `categoria` | asc | Filtrar por categoría |
| `clientes` | `activo` | asc | Filtrar activos/inactivos |
| `clientes` | `cuit` | sparse | Búsqueda por CUIT (nullable) |
| `modelos_vela` | `nombre`, `descripcion`, `aromas` | text | Búsqueda en catálogo |
| `modelos_vela` | `tipoCera`, `activo` | asc | Filtrado por material |
| `productos` | `modelo`, `tamano` | unique | Evitar SKUs duplicados |
| `productos` | `activo`, `destacado` | asc | Catálogo y destacados |
| `productos` | `stock` | asc | Alertas de stock bajo |
| `productos` | `modeloNombre`, `tamanoNombre`, `aroma` | text | Búsqueda full-text |
| `pedidos` | `cliente`, `createdAt` | asc/desc | Historial de pedidos por cliente |
| `pedidos` | `estado`, `createdAt` | asc/desc | Panel de administración |
| `pedidos` | `estadoPago` | asc | Filtrado por estado de pago |
