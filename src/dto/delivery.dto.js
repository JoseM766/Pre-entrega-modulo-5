export const toDeliveryDTO = (delivery) => {
  if (!delivery) return null;

  return {
    id: delivery._id ?? delivery.id,
    order: delivery.order,
    driver: delivery.driver,
    status: delivery.status,
    priority: delivery.priority,
    createdAt: delivery.createdAt,
  };
};
