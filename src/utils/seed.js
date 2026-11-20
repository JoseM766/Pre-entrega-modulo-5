// Script standalone para crear usuarios y productos de prueba.
// Se ejecuta una sola vez, a mano, con: npm run seed
//
// No se usa el endpoint público de registro porque ese siempre fuerza
// role: USER (a propósito, por seguridad). Este script sí puede asignar
// cualquier rol porque corre del lado del servidor, no expuesto por HTTP.

import { logger } from "../config/logger.js";
import { connectDB, disconnectDB } from "../config/db.config.js";
import * as usersRepository from "../repositories/users.repository.js";
import * as productsRepository from "../repositories/products.repository.js";
import { hashPassword } from "./hash.js";
import { USER_ROLES, PRODUCT_STATUS } from "../constants/index.js";

const TEST_USERS = [
  {
    first_name: "Admin",
    last_name: "ShipNow",
    email: "admin@shipnow.com",
    password: "admin1234",
    role: USER_ROLES.ADMIN,
  },
  {
    first_name: "Juan",
    last_name: "Cliente",
    email: "user@shipnow.com",
    password: "user1234",
    role: USER_ROLES.USER,
  },
  {
    first_name: "Pedro",
    last_name: "Repartidor",
    email: "driver@shipnow.com",
    password: "driver1234",
    role: USER_ROLES.DRIVER,
  },
];

const TEST_PRODUCTS = [
  { name: "Caja chica 20x20", description: "Caja de cartón para envíos chicos", category: "embalaje", price: 450, stock: 120 },
  { name: "Caja grande 50x40", description: "Caja de cartón reforzado para envíos grandes", category: "embalaje", price: 980, stock: 60 },
  { name: "Cinta de embalar", description: "Rollo de cinta de 48mm x 100m", category: "insumos", price: 320, stock: 0 },
];

const seed = async () => {
  try {
    await connectDB();

    for (const testUser of TEST_USERS) {
      const existingUser = await usersRepository.findUserByEmail(testUser.email);

      if (existingUser) {
        logger.info(`Ya existe: ${testUser.email} (${testUser.role}) — se omite`);
        continue;
      }

      const hashedPassword = await hashPassword(testUser.password);

      await usersRepository.createUser({
        ...testUser,
        password: hashedPassword,
      });

      logger.info(`Creado: ${testUser.email} / ${testUser.password} (${testUser.role})`);
    }

    for (const testProduct of TEST_PRODUCTS) {
      const existingProduct = await productsRepository.findProductByName(testProduct.name);

      if (existingProduct) {
        logger.info(`Ya existe: ${testProduct.name} — se omite`);
        continue;
      }

      await productsRepository.createProduct({
        ...testProduct,
        status: testProduct.stock > 0 ? PRODUCT_STATUS.AVAILABLE : PRODUCT_STATUS.OUT_OF_STOCK,
      });

      logger.info(`Creado producto: ${testProduct.name}`);
    }

    logger.info("Seed finalizado");
  } catch (error) {
    logger.error(`Error al ejecutar el seed: ${error.message}`, { stack: error.stack });
  } finally {
    await disconnectDB();
  }
};

seed();
