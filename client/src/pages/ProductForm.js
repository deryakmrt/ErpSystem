import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById } from '../services/productService';
import './ProductForm.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    basePrice: '',
    unit: 'Adet',
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Düzenleme modunda ürünü yükle
  useEffect(() => {
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await getProductById(id);
      setFormData({
        code: product.code,
        name: product.name,
        description: product.description || '',
        basePrice: product.basePrice.toString(),
        unit: product.unit,
        isActive: product.isActive
      });
      setError(null);
    } catch (err) {
      setError('Ürün yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.code || !formData.name || !formData.basePrice) {
      setError('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productData = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        basePrice: parseFloat(formData.basePrice),
        unit: formData.unit,
        isActive: formData.isActive
      };

      if (isEditMode) {
        await updateProduct(id, productData);
        alert('Ürün başarıyla güncellendi!');
      } else {
        await createProduct(productData);
        alert('Ürün başarıyla eklendi!');
      }

      navigate('/');
    } catch (err) {
      setError('İşlem sırasında hata oluştu: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h1>{isEditMode ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          ← Geri Dön
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="code">
              Ürün Kodu <span className="required">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={isEditMode} // Kod düzenlenemez
              placeholder="LED-001"
              required
            />
            {isEditMode && (
              <small className="form-text">Ürün kodu düzenlenemez</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">
              Ürün Adı <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="LED Armatür"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Açıklama</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Ürün açıklaması..."
            rows="3"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="basePrice">
              Fiyat (₺) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="basePrice"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              placeholder="250.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Birim</label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
            >
              <option value="Adet">Adet</option>
              <option value="Kutu">Kutu</option>
              <option value="Paket">Paket</option>
              <option value="Kg">Kg</option>
              <option value="Metre">Metre</option>
              <option value="Litre">Litre</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <span>Aktif</span>
          </label>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            İptal
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'İşleniyor...' : (isEditMode ? 'Güncelle' : 'Kaydet')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;