import React, { useState, useEffect } from 'react';
import { getMasterProducts, deleteProduct, getProductVariants } from '../services/productService';
import { useNavigate } from 'react-router-dom';
import './ProductList.css';

const getSymbol = (curr) => curr === 'USD' ? '$' : curr === 'EUR' ? '€' : '₺';
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [variants, setVariants] = useState({});
  const navigate = useNavigate();

  // Ürünleri yükle (sadece ana ürünler)
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getMasterProducts(); // Sadece ana ürünler
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Ürünler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Varyasyonları yükle
  const loadVariants = async (productId) => {
    try {
      const variantData = await getProductVariants(productId);
      setVariants(prev => ({ ...prev, [productId]: variantData }));
    } catch (err) {
      console.error('Varyasyonlar yüklenemedi:', err);
    }
  };

  // Varyasyon panelini aç/kapat
  const toggleVariants = (productId) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
    } else {
      setExpandedProduct(productId);
      if (!variants[productId]) {
        loadVariants(productId);
      }
    }
  };

  // Ürün sil
const handleDelete = async (id) => {
    // 🟢 YENİ: Güçlü Uyarı
    if (window.confirm('DİKKAT! Bu ana ürünü silerseniz bağlı TÜM VARYASYONLAR da silinecektir.\n\nEmin misiniz?')) {
      try {
        await deleteProduct(id);
        loadProducts(); // Listeyi yenile
      } catch (err) {
        console.error('Silme hatası:', err);
        alert('Silinirken bir hata oluştu.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-list-container">
      <div className="header">
        <h1>Ürün Listesi</h1>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/products/new')}
        >
          + Yeni Ürün Ekle
        </button>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Henüz ürün bulunmuyor.</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/products/new')}
          >
            İlk Ürünü Ekle
          </button>
        </div>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th style={{width: '40px'}}></th>
              <th>Kod</th>
              <th>Ürün Adı</th>
              <th>Fiyat</th>
              <th>Birim</th>
              <th>Varyasyon</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <React.Fragment key={product.id}>
                {/* Ana Ürün Satırı */}
                <tr>
                  <td>
                    {product.variantCount > 0 && (
                      <button
                        className="expand-btn"
                        onClick={() => toggleVariants(product.id)}
                        title="Varyasyonları göster/gizle"
                      >
                        {expandedProduct === product.id ? '▼' : '▶'}
                      </button>
                    )}
                  </td>
                  <td><code>{product.code}</code></td>
                  <td><strong>{product.name}</strong></td>
                  <td>{product.basePrice?.toFixed(2)} {getSymbol(product.currency || 'TL')}</td>
                  <td>{product.unit}</td>
                  <td>
                    {product.variantCount > 0 ? (
                      <span className="variant-badge">
                        {product.variantCount} varyasyon
                      </span>
                    ) : (
                      <span className="no-variant">-</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                      {product.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-view"
                        onClick={() => navigate(`/products/${product.id}`)}
                        title="Detay"
                      >
                        👁️
                      </button>
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => navigate(`/products/${product.id}/edit`)}
                        title="Düzenle"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Varyasyon Satırları */}
                {expandedProduct === product.id && variants[product.id] && (
                  variants[product.id].map(variant => (
                    <tr key={`variant-${variant.id}`} className="variant-row">
                      <td></td>
                      <td><code className="variant-code">↳ {variant.sku}</code></td>
                      <td className="variant-name">{variant.name}</td>
                      {/* 🟢 DÜZELTİLDİ: Sabit ₺ yerine babadan gelen currency kullanılıyor */}
                      <td>{variant.price.toFixed(2)} {getSymbol(variant.currency || 'TL')}</td>
                      {/* 🟢 YENİ: Birim - babadan gelir */}
                      <td>{variant.unit || '-'}</td>
                      <td>
                        <small className="variant-summary">{variant.summary || '-'}</small>
                      </td>
                      <td>
                        <span className={`status-badge ${variant.isActive ? 'active' : 'inactive'}`}>
                          {variant.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-edit"
                            onClick={() => navigate(`/products/${variant.id}/edit`)}
                            title="Düzenle"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn btn-sm btn-delete"
                            onClick={() => handleDelete(variant.id, variant.name)}
                            title="Sil"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;