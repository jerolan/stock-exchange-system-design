# Exchange Matching Engine Demo (Bun + TypeScript)

Este proyecto es una **ejemplo** de cómo funciona el núcleo de un **stock exchange / matching engine** moderno, enfocada en **arquitectura**, **flujo de eventos**, y **modelado correcto del estado**.

Basado en https://newsletter.systemdesign.one/p/stock-exchange-system-design

El objetivo principal es **hacer visibles conceptos como**:

- estado en memoria vs estado duradero
- hot path vs cold path
- WAL (Write-Ahead Log)
- event sourcing
- CQRS
- consistencia vs disponibilidad (CAP)
- crash y recuperación determinista

---

## Qué NO es este proyecto

Antes de empezar, es importante aclarar lo que este proyecto **no pretende ser**:

- No es un exchange real ni seguro para producción.
- No implementa FIX, autenticación ni control de riesgo real.
- No está optimizado para microsegundos.
- No usa concurrencia real ni múltiples procesos.

---

## Idea central

El sistema se construye alrededor de estas reglas:

1. El **matching engine** mantiene el estado crítico en memoria.
2. Cada hecho importante se escribe primero en un **WAL append-only**.
3. Si el proceso cae, el estado se reconstruye **reproduciendo el WAL**.
4. Las vistas de lectura se actualizan de forma **lenta y desacoplada**.
5. El matching nunca espera a las vistas ni a la persistencia.

---

## Arquitectura general

```
Clientes / HTTP
      ↓
   Server (API)
      ↓
Matching Engine (core CP)
      ↓
   EventBus (desacople)
      ↓
   Views (read models)

Matching Engine → WAL (durabilidad)
```

---

## Estructura del proyecto

```
src/
│
├── main.ts                # Punto de entrada
├── composition.ts         # Composition Root (wiring)
│
├── core/
│   ├── matchingEngine.ts  # Núcleo del mercado (CP)
│   ├── orderBook.ts       # Libro de órdenes en memoria
│   ├── dll.ts             # Doubly Linked List (FIFO O(1))
│   └── types.ts           # Contratos del dominio
│
├── infra/
│   ├── wal.ts             # Write-Ahead Log (durabilidad)
│   └── eventBus.ts        # Desacople core → vistas
│
├── views/
│   ├── views.ts           # Proyecciones lentas
│   └── openOrdersView.ts  # Read model: órdenes en firme
│
└── api/
    └── server.ts          # HTTP
```

---

## Componentes clave

### Matching Engine (`core/matchingEngine.ts`)

Características:

- single-thread
- determinista
- sin async
- sin locks
- sin llamadas externas (excepto WAL)

Responsabilidades:

- aplicar reglas precio-tiempo
- mantener el order book en memoria
- producir eventos `TRADE`

---

### Order Book (`core/orderBook.ts`)

Modelo realista de un libro de órdenes:

- un mapa por precio
- cada precio tiene una **cola FIFO**
- cancelaciones O(1) vía índice `orderId → nodo`

---

### WAL – Write-Ahead Log (`infra/wal.ts`)

El WAL es la **fuente de verdad**:

- append-only
- orden total
- durable

---

### EventBus (`infra/eventBus.ts`)

Canal en memoria que desacopla:

- matching (rápido)
- vistas (lentas)

---

### Views (`views/`)

Las vistas son **proyecciones de lectura**:

- consumen eventos lentamente
- pueden estar atrasadas
- no bloquean el matching

Ejemplo:

- `openOrdersView` muestra órdenes en firme

---

### Server (`api/server.ts`)

Adaptador HTTP.

Responsabilidades:

- exponer endpoints
- no contener lógica de negocio

Endpoints principales:

- `GET /orders/open`
- `POST /crash`

---

## Crash y recuperación

```
POST /crash
```

El proceso muere (`process.exit`).

Al reiniciar:

1. Se lee el WAL
2. Se reprocesan los eventos
3. El order book se reconstruye
4. Las vistas se regeneran

No hay estados intermedios corruptos.

---

## Hot path vs Cold path

Este proyecto muestra claramente:

- **Hot path**: matching en memoria (rápido)
- **Cold path**: vistas y consultas (lentas)

La latencia en las vistas es **intencional**.

---

## Cómo ejecutar

```bash
bun install
bun run src/main.ts
```

Consultar:

```
GET http://localhost:3000/orders/open
```

Forzar crash:

```
POST http://localhost:3000/crash
```

Reinicia el proceso y observa que el estado se reconstruye.
