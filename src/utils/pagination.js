import { PAGINATION } from "../constants/index.js";

// Convierte page/limit de la query en números válidos (con tope máximo).
export const parsePagination = ({ page, limit }) => {
  const currentPage = Math.max(parseInt(page, 10) || PAGINATION.DEFAULT_PAGE, 1);
  const pageLimit = Math.min(parseInt(limit, 10) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);

  return { page: currentPage, limit: pageLimit, skip: (currentPage - 1) * pageLimit };
};

export const buildPage = ({ data, total, page, limit }) => ({
  data,
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 0,
});
