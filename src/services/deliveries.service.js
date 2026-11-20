import { logger } from "../config/logger.js";
import * as deliveriesRepository from "../repositories/deliveries.repository.js";
import * as ordersRepository from "../repositories/orders.repository.js";
import * as usersRepository from "../repositories/users.repository.js";
import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_STATUS,
  DELIVERY_PRIORITY,
  DELIVERY_STATUS_TRANSITIONS,
  DELIVERY_TO_ORDER_STATUS,
} from "../constants/index.js";
import {
  MissingFieldsError,
  InvalidPriorityError,
  InvalidOrderStatusError,
  InvalidDeliveryStatusError,
  InvalidDriverError,
  OrderNotFoundError,
  UserNotFoundError,
  DeliveryNotFoundError,
  ForbiddenError,
} from "../errors/index.js";
import { parsePagination, buildPage } from "../utils/pagination.js";

// Un repartidor solo puede ver y modificar SUS entregas; el admin, todas.
const assertCanAccess = (requester, delivery) => {
  const isOwnDelivery = String(delivery.driver) === String(requester.id);
  if (requester.role !== USER_ROLES.ADMIN && !isOwnDelivery) {
    throw new ForbiddenError();
  }
};

const findDeliveryOrFail = async (deliveryId) => {
  const delivery = await deliveriesRepository.findDeliveryById(deliveryId);

  if (!delivery) {
    logger.warning(`Entrega no encontrada: id ${deliveryId}`);
    throw new DeliveryNotFoundError();
  }

  return delivery;
};

// --- Asignar un pedido a un repartidor (crea la entrega) ---
export const createDelivery = async ({ orderId, driverId, priority }) => {
  if (!orderId || !driverId) {
    throw new MissingFieldsError();
  }

  const order = await ordersRepository.findOrderById(orderId);
  if (!order) {
    throw new OrderNotFoundError();
  }

  // Solo un pedido recién creado puede asignarse (no uno ya asignado, entregado o cancelado).
  if (order.status !== ORDER_STATUS.CREATED) {
    throw new InvalidOrderStatusError(
      `Solo se puede asignar un repartidor a un pedido en estado "${ORDER_STATUS.CREATED}" (estado actual: "${order.status}")`
    );
  }

  const driver = await usersRepository.findUserById(driverId);
  if (!driver) {
    throw new UserNotFoundError();
  }
  if (driver.role !== USER_ROLES.DRIVER) {
    throw new InvalidDriverError();
  }

  const finalPriority = priority ?? order.priority;
  if (!Object.values(DELIVERY_PRIORITY).includes(finalPriority)) {
    throw new InvalidPriorityError();
  }

  const delivery = await deliveriesRepository.createDelivery({
    order: order._id,
    driver: driver._id,
    status: DELIVERY_STATUS.ASSIGNED,
    priority: finalPriority,
  });
  await ordersRepository.updateOrderStatusById(order._id, ORDER_STATUS.ASSIGNED);

  logger.info(`Entrega creada: id ${delivery._id} (pedido ${order._id}, repartidor ${driver._id})`);
  return delivery;
};

// --- Listar entregas ---
export const listDeliveries = async ({ requester, status, page, limit }) => {
  if (status && !Object.values(DELIVERY_STATUS).includes(status)) {
    throw new InvalidDeliveryStatusError();
  }

  const filter = {};
  if (status) filter.status = status;
  if (requester.role !== USER_ROLES.ADMIN) filter.driver = requester.id;

  const pagination = parsePagination({ page, limit });
  const { data, total } = await deliveriesRepository.findDeliveries({
    filter,
    skip: pagination.skip,
    limit: pagination.limit,
  });

  return buildPage({ data, total, page: pagination.page, limit: pagination.limit });
};

// --- Consultar una entrega ---
export const getDeliveryById = async ({ requester, deliveryId }) => {
  const delivery = await findDeliveryOrFail(deliveryId);
  assertCanAccess(requester, delivery);
  return delivery;
};

// --- Avanzar el estado de una entrega (y, con él, el del pedido) ---
export const updateDeliveryStatus = async ({ requester, deliveryId, status }) => {
  if (!status) {
    throw new MissingFieldsError();
  }

  if (!Object.values(DELIVERY_STATUS).includes(status)) {
    throw new InvalidDeliveryStatusError();
  }

  const delivery = await findDeliveryOrFail(deliveryId);
  assertCanAccess(requester, delivery);

  if (!DELIVERY_STATUS_TRANSITIONS[delivery.status].includes(status)) {
    throw new InvalidDeliveryStatusError(
      `No se puede pasar una entrega de "${delivery.status}" a "${status}"`
    );
  }

  const updatedDelivery = await deliveriesRepository.updateDeliveryStatusById(deliveryId, status);
  await ordersRepository.updateOrderStatusById(delivery.order, DELIVERY_TO_ORDER_STATUS[status]);

  logger.info(`Entrega ${deliveryId}: ${delivery.status} → ${status}`);
  return updatedDelivery;
};
