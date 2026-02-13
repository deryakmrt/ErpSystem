import api from './api';

// Sadece ana ürünleri getir (varyasyonlar hariç)
export const getMasterProducts = async () => {
  const response = await api.get('/products/masters');
  return response.data;
};

// Tüm ürünleri getir (ana + varyasyonlar)
export const getAllProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

// Tek ürün getir
export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

// Koda göre ürün getir
export const getProductByCode = async (code) => {
  const response = await api.get(`/products/by-sku/${code}`);
  return response.data;
};

// Yeni ürün ekle
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

// Ürün güncelle
export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Ürün sil
export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Ürün varyasyonlarını getir
export const getProductVariants = async (id) => {
  const response = await api.get(`/products/${id}/variants`);
  return response.data;
};