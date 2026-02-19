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
// --- YENİ: SABİT KRİTER (ATTRIBUTE) API İSTEKLERİ ---

// Sabit kriterleri veritabanından getir
export const getProductAttributes = async () => {
  const response = await api.get('/ProductAttributes');
  return response.data;
};

// Yeni sabit kriteri veritabanına ekle
export const createProductAttribute = async (attributeData) => {
  const response = await api.post('/ProductAttributes', attributeData);
  return response.data;
};

// 👇 YENİ: Sabit kriteri güncelle
export const updateProductAttribute = async (id, attributeData) => {
  const response = await api.get(`/ProductAttributes/${id}`, attributeData); // Not: Backend'de PutMapping yaptık
  return response.data;
};

// Asıl güncelleme isteği (PUT)
export const updateProductAttributePut = async (id, attributeData) => {
  const response = await api.put(`/ProductAttributes/${id}`, attributeData);
  return response.data;
};

// 👇 YENİ: Sabit kriteri sil (pasife çek)
export const deleteProductAttribute = async (id) => {
  const response = await api.delete(`/ProductAttributes/${id}`);
  return response.data;
};
export const restoreProductAttribute = async (id) => {
  const response = await api.post(`/ProductAttributes/${id}/restore`);
  return response.data;
};