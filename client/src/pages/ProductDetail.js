import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProductVariants, deleteProduct } from '../services/productService';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      setLoading(true);
      const [productData, variantsData] = await Promise.all([
        getProductById(id),
        getProductVariants(id)
      ]);
      setProduct(productData);
      setVariants(variantsData);
      setError(null);
    } catch (err) {
      setError('Ürün yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`"${product.name}" ürününü silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteProduct(id);
        alert('Ürün başarıyla silindi!');
        navigate('/');
      } catch (err) {
        alert('Ürün silinirken hata oluştu: ' + err.message);
      }
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="error">Ürün bulunamadı</div>;
  }

  return (
    <div className="product-detail-container">
      {/* Header */}
      <div className="detail-header">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          ← Geri
        </button>
        <h1>Ürün Detayı</h1>
        <div className="header-actions">
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            ✏️ Düzenle
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleDelete}
          >
            🗑️ Sil
          </button>
        </div>
      </div>

      {/* Ürün Bilgileri */}
      <div className="product-info-card">
        <div className="info-header">
          <h2>{product.name}</h2>
          <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
            {product.isActive ? '✓ Aktif' : '✗ Pasif'}
          </span>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <label>Ürün Kodu:</label>
            <span>{product.code}</span>
          </div>
          <div className="info-item">
            <label>Birim Fiyat:</label>
            <span className="price">{product.basePrice.toFixed(2)} ₺</span>
          </div>
          <div className="info-item">
            <label>Birim:</label>
            <span>{product.unit}</span>
          </div>
          <div className="info-item">
            <label>Oluşturma Tarihi:</label>
            <span>{new Date(product.createdAt).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>

        {product.description && (
          <div className="info-description">
            <label>Açıklama:</label>
            <p>{product.description}</p>
          </div>
        )}
      </div>

      {/* Varyasyonlar */}
      <div className="variants-section">
        <div className="variants-header">
          <h3>Varyasyonlar ({variants.length})</h3>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/products/${id}/variants/new`)}
          >
            + Yeni Varyasyon Ekle
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="empty-variants">
            <p>Bu ürüne ait varyasyon bulunmuyor.</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate(`/products/${id}/variants/new`)}
            >
              İlk Varyasyonu Ekle
            </button>
          </div>
        ) : (
          <div className="variants-table-wrapper">
            <table className="variants-table">
              <thead>
                <tr>
                  <th>Varyasyon Kodu</th>
                  <th>Varyasyon Adı</th>
                  <th>Açıklama</th>
                  <th>Fiyat</th>
                  <th>SKU</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => (
                  <tr key={variant.id}>
                    <td><strong>{variant.variantCode}</strong></td>
                    <td>{variant.variantName}</td>
                    <td>{variant.description || '-'}</td>
                    <td className="price">{variant.price.toFixed(2)} ₺</td>
                    <td>{variant.sku || '-'}</td>
                    <td>
                      <span className={`status ${variant.isActive ? 'active' : 'inactive'}`}>
                        {variant.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => navigate(`/products/${id}/variants/${variant.id}/edit`)}
                        >
                          Düzenle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;