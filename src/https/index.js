import { axiosWrapper, BACKEND_URL } from "./axiosWrapper";

export { BACKEND_URL };

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table/", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);

// Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order/", data);
export const getOrders = (params = {}) => axiosWrapper.get("/api/order", { params });
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
export const deleteOrder = (orderId) => axiosWrapper.delete(`/api/order/${orderId}`);
export const deleteAllOrders = () => axiosWrapper.delete("/api/order/delete-all");

// Product Endpoints
export const getProducts = () => axiosWrapper.get("/api/product");
export const addProduct = (data) => axiosWrapper.post("/api/product", data);
export const updateProduct = ({ productId, ...data }) => {
  const body = data.formData ? data.formData : data;
  return axiosWrapper.put(`/api/product/${productId}`, body);
}
export const deleteProduct = (productId) => axiosWrapper.delete(`/api/product/${productId}`);

// Category Endpoints
export const getCategories = () => axiosWrapper.get("/api/category");
export const addCategory = (data) => axiosWrapper.post("/api/category", data);
export const updateCategory = ({ categoryId, ...data }) => axiosWrapper.put(`/api/category/${categoryId}`, data);
export const deleteCategory = (categoryId) => axiosWrapper.delete(`/api/category/${categoryId}`);

// Dashboard Endpoints
export const getDashboardStats = (period = 'day', startDate = null, endDate = null) => {
  let url = `/api/dashboard?period=${period}`;
  if (period === 'custom' && startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`;
  }
  return axiosWrapper.get(url);
};
