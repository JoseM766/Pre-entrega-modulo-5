import * as deliveriesService from "../services/deliveries.service.js";
import { toDeliveryDTO } from "../dto/delivery.dto.js";

export const createDelivery = async (req, res, next) => {
  try {
    const { orderId, driverId, priority } = req.body;
    const delivery = await deliveriesService.createDelivery({ orderId, driverId, priority });

    res.status(201).json({ status: "success", payload: toDeliveryDTO(delivery) });
  } catch (error) {
    next(error);
  }
};

export const getDeliveries = async (req, res, next) => {
  try {
    const { status, page, limit } = req.query;
    const result = await deliveriesService.listDeliveries({ requester: req.user, status, page, limit });

    res.status(200).json({
      status: "success",
      data: result.data.map(toDeliveryDTO),
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await deliveriesService.getDeliveryById({
      requester: req.user,
      deliveryId: req.params.id,
    });
    res.status(200).json({ status: "success", payload: toDeliveryDTO(delivery) });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const delivery = await deliveriesService.updateDeliveryStatus({
      requester: req.user,
      deliveryId: req.params.id,
      status: req.body.status,
    });
    res.status(200).json({ status: "success", payload: toDeliveryDTO(delivery) });
  } catch (error) {
    next(error);
  }
};
