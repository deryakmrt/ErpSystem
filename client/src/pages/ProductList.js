import React, { useState, useEffect } from 'react';
import { getAllProducts, deleteProduct } from '../services/productService';
import { useNavigate } from 'react-router-dom';
import './ProductList.css';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Ürünleri yükle
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Ürünler yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ürün sil
  const handleDelete = async (id, name) => {
    if (window.confirm(`"${name}" ürününü silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteProduct(id);
        loadProducts(); // Listeyi yenile
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
              <th>Kod</th>
              <th>Ürün Adı</th>
              <th>Açıklama</th>
              <th>Fiyat</th>
              <th>Birim</th>
              <th>Varyasyon</th>
              <th>Durum</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.code}</td>
                <td><strong>{product.name}</strong></td>
                <td>{product.description || '-'}</td>
                <td>{product.basePrice.toFixed(2)} ₺</td>
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
                  <span className={`status ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-info"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      Detay
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      Düzenle
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductList;