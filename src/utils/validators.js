export const hasRequiredRegisterFields = ({ first_name, last_name, email, password }) => {
  return Boolean(first_name && last_name && email && password);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const isValidPassword = (password) => {
  return typeof password === "string" && password.length >= 8;
};

export const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};

// --- Validadores de Product ---

export const hasRequiredProductFields = ({ name, description, category }) => {
  return Boolean(name && description && category);
};

export const isValidPrice = (price) => {
  return typeof price === "number" && price >= 0;
};

export const isValidStock = (stock) => {
  return Number.isInteger(stock) && stock >= 0;
};

// --- Validadores de Order ---

export const hasRequiredOrderFields = ({ items, deliveryAddress }) => {
  return Boolean(items !== undefined && deliveryAddress);
};

export const areValidOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return false;

  return items.every(
    (item) =>
      item &&
      typeof item.name === "string" &&
      item.name.trim() !== "" &&
      Number.isInteger(item.quantity) &&
      item.quantity >= 1 &&
      typeof item.price === "number" &&
      item.price >= 0
  );
};
