# ShipNow — Pre-entrega Módulo 5: Documentación de API con Swagger

Documentación interactiva de ShipNow API con **Swagger UI / OpenAPI 3**, desde donde se pueden consultar y probar los endpoints.

## Ruta de la documentación

```
http://localhost:8080/api/docs
```

(si cambiás `PORT` en el `.env`, usá ese puerto).

## Cómo levantar el servidor

```bash
npm install
cp .env.example .env     # completar MONGODB_URI y JWT_SECRET
npm run seed             # crea usuarios y productos de prueba
npm run dev
```

Después abrí `http://localhost:8080/api/docs` en el navegador.

## Qué está documentado

Los endpoints están agrupados por tags:

| Tag | Qué documenta |
|---|---|
| **Users** | `GET /api/users`, `GET /api/users/{id}` |
| **Orders** | `GET /api/orders`, `POST /api/orders`, `GET /api/orders/{id}` |
| **Deliveries** | `GET /api/deliveries`, `POST /api/deliveries`, `GET /api/deliveries/{id}`, `PATCH /api/deliveries/{id}/status` |
| **Mocks** | `GET /api/mocks/users` (y alias `mockingusers`), `GET /api/mocks/orders` (y alias `mockingorders`), `GET /api/mocks/deliveries`, `POST /api/mocks/seed`, `POST /api/mocks/generateData` |
| **Logger** | `GET /api/loggerTest` (herramienta interna de validación, no es funcionalidad de negocio) |
| Sessions | register, login, current, logout (necesarios para probar los endpoints protegidos) |
| Products | CRUD de productos |
| Health | `GET /api/health` |

Cada endpoint indica método, ruta, descripción, parámetros, body esperado (con ejemplo), respuesta exitosa y errores posibles con sus códigos.

**Schemas reutilizables** (`components/schemas`): `User`, `Order`, `OrderItem`, `Delivery`, `Product`, `SuccessResponse`, `ErrorResponse`, enums de estados/roles/prioridades y respuestas envolventes (`OrderResponse`, `OrderListResponse`, etc.).

**Errores:** todos usan el schema `ErrorResponse` (`status`, `error`, `message`) del manejo de errores del Módulo 3. Los códigos documentados en cada endpoint son los que la API realmente devuelve, incluidos: datos inválidos (`400`), no autenticado (`401`), sin permisos (`403`), no encontrado (`404`), conflicto (`409`), error interno (`500`), cantidad inválida en mocks (`INVALID_MOCK_AMOUNT`) y estado inválido en pedidos y entregas (`INVALID_ORDER_STATUS`, `INVALID_DELIVERY_STATUS`).

## Cómo probar los endpoints desde Swagger

1. Corré `npm run seed` una vez.
2. En Swagger, abrí **Sessions → POST /api/sessions/login**, tocá **Try it out** e ingresá un usuario de prueba:

   | Rol | Email | Contraseña |
   |---|---|---|
   | admin | `admin@shipnow.com` | `admin1234` |
   | cliente (`user`) | `user@shipnow.com` | `user1234` |
   | repartidor (`driver`) | `driver@shipnow.com` | `driver1234` |

3. La sesión se guarda en una cookie y Swagger la envía sola en los siguientes pedidos. Para probar con otro rol, hacé login de nuevo con ese usuario.

**Flujo sugerido de pedido y entrega:**

1. Como **cliente**: `POST /api/orders` (guardá el `id` del pedido).
2. Como **admin**: `GET /api/users` para ver el `id` del repartidor y `POST /api/deliveries` con `orderId` y `driverId`.
3. Como **repartidor**: `PATCH /api/deliveries/{id}/status` con `picked_up`, luego `in_transit` y por último `delivered`. El estado del pedido se actualiza solo.

**Aclaraciones:**
- Las entregas solo avanzan un paso por vez (`assigned → picked_up → in_transit → delivered`); si se salta un paso responde `INVALID_DELIVERY_STATUS`.
- Un cliente solo ve sus pedidos y un repartidor solo sus entregas; el admin ve todo.
- Los endpoints de **Mocks** no existen si `NODE_ENV=production`. El `POST /api/mocks/generateData` inserta datos reales en la base.
- `GET /api/loggerTest` genera logs de todos los niveles; no es una funcionalidad de negocio.

## Pedidos y entregas

Para poder documentar los módulos de pedidos y entregas se incorporaron sus endpoints, con la misma arquitectura por capas (router → controller → service → repository → modelo):

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/orders` | user, admin | Crea un pedido. El cliente es el usuario autenticado, el total se calcula y el estado inicial es `created` |
| GET | `/api/orders` | user, admin | Lista pedidos (el cliente ve solo los suyos). Filtros: `status`, `page`, `limit` |
| GET | `/api/orders/{id}` | user, admin | Detalle de un pedido |
| POST | `/api/deliveries` | admin | Asigna un pedido `created` a un repartidor y lo pasa a `assigned` |
| GET | `/api/deliveries` | admin, driver | Lista entregas (el repartidor ve solo las suyas) |
| GET | `/api/deliveries/{id}` | admin, driver | Detalle de una entrega |
| PATCH | `/api/deliveries/{id}/status` | admin, driver | Avanza el estado de la entrega y del pedido |

## Organización de la documentación

La configuración de Swagger está separada de las rutas, en `src/docs/`:

```
src/docs/
├── swagger.config.js   # info general (nombre, versión, descripción), servidor local y tags
├── schemas.yaml        # schemas reutilizables y seguridad (cookie)
├── sessions.yaml
├── users.yaml
├── products.yaml
├── orders.yaml
├── deliveries.yaml
├── mocks.yaml
└── logger.yaml
```

`app.js` solo monta la interfaz: `app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpecs))`.

Tecnologías: `swagger-jsdoc` (arma la especificación a partir de los `.yaml`) y `swagger-ui-express` (muestra la interfaz).
