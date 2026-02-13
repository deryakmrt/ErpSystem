import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById, getProductVariants } from '../services/productService';
import SkuBuilder from '../components/SkuBuilder';
import './ProductForm.css';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    unit: 'Adet',
    category: '',
    isActive: true
  });

  const [variants, setVariants] = useState([]);
  const [existingVariants, setExistingVariants] = useState([]); // Edit modunda var olan varyasyonlar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Düzenleme modunda ürünü yükle
  useEffect(() => {
    if (isEditMode) {
      loadProduct();
      loadExistingVariants();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await getProductById(id);
      
      setFormData({
        sku: product.code || product.sku || '',
        name: product.name || '',
        description: product.description || '',
        price: (product.basePrice || product.price || 0).toString(),
        unit: product.unit || 'Adet',
        category: product.category || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
      setError(null);
    } catch (err) {
      setError('Ürün yüklenirken hata oluştu: ' + err.message);
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingVariants = async () => {
    try {
      const variantData = await getProductVariants(id);
      setExistingVariants(variantData);
    } catch (err) {
      console.error('Varyasyonlar yüklenemedi:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVariantsChange = (newVariants) => {
    setVariants(newVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyon
    if (!formData.sku || !formData.name || !formData.price) {
      setError('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Ana ürün verisi - Backend field isimleriyle
      const productData = {
        code: formData.sku,
        name: formData.name,
        description: formData.description || null,
        basePrice: parseFloat(formData.price),
        unit: formData.unit,
        category: formData.category || null,
        isActive: formData.isActive,
        parentId: null // Ana ürün
      };

      let createdProduct;

      if (isEditMode) {
        await updateProduct(id, productData);
        
        // Edit modunda yeni varyasyonlar eklendiyse
        if (variants.length > 0) {
          let successCount = 0;
          for (const variant of variants) {
            try {
              const variantData = {
                code: variant.sku,
                name: variant.name,
                description: null,
                basePrice: variant.price,
                unit: formData.unit,
                category: formData.category,
                isActive: variant.isActive,
                parentId: parseInt(id),
                summary: variant.summary,
                stockQuantity: variant.stockQuantity || 0
              };
              
              await createProduct(variantData);
              successCount++;
            } catch (varErr) {
              console.error(`Varyasyon hatası (${variant.sku}):`, varErr);
            }
          }
          
          alert(`✅ Ürün güncellendi${successCount > 0 ? ` ve ${successCount} yeni varyasyon eklendi` : ''}!`);
        } else {
          alert('✅ Ürün başarıyla güncellendi!');
        }
        
        navigate('/');
      } else {
        // Yeni ürün oluştur
        createdProduct = await createProduct(productData);
        
        // Varyasyonlar varsa ekle
        if (variants.length > 0) {
          let successCount = 0;
          let failedVariants = [];

          for (const variant of variants) {
            try {
              const variantData = {
                code: variant.sku,
                name: variant.name,
                description: null,
                basePrice: variant.price,
                unit: formData.unit,
                category: formData.category,
                isActive: variant.isActive,
                parentId: createdProduct.id,
                summary: variant.summary,
                stockQuantity: variant.stockQuantity || 0
              };
              
              await createProduct(variantData);
              successCount++;
            } catch (varErr) {
              console.error(`Varyasyon hatası (${variant.sku}):`, varErr);
              failedVariants.push({
                sku: variant.sku,
                error: varErr.response?.data?.message || varErr.message
              });
            }
          }

          // Sonuç raporu
          if (failedVariants.length === 0) {
            alert(`✅ Ürün ve ${successCount} varyasyon başarıyla eklendi!`);
            navigate('/');
          } else {
            const failedSkus = failedVariants.map(f => f.sku).join(', ');
            const errorMsg = `⚠️ Ana ürün ve ${successCount} varyasyon eklendi.\n\nAncak ${failedVariants.length} varyasyon eklenemedi:\n${failedSkus}\n\nNeden: SKU zaten kullanılıyor olabilir.`;
            alert(errorMsg);
            navigate('/');
          }
        } else {
          alert('✅ Ürün başarıyla eklendi!');
          navigate('/');
        }
      }
    } catch (err) {
      setError('İşlem sırasında hata oluştu: ' + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.sku) {
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
        {/* Temel Bilgiler */}
        <div className="form-section">
          <h3>📋 Temel Bilgiler</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sku">
                Ürün Kodu (SKU) <span className="required">*</span>
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                disabled={isEditMode}
                placeholder="AR-A"
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
                placeholder="LED Armatür A Serisi"
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
              <label htmlFor="price">
                Fiyat (₺) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
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

            <div className="form-group">
              <label htmlFor="category">Kategori</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Aydınlatma"
              />
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
        </div>

        {/* Var Olan Varyasyonlar (Edit modunda) */}
        {isEditMode && existingVariants.length > 0 && (
          <div className="form-section">
            <h3>📦 Mevcut Varyasyonlar ({existingVariants.length})</h3>
            <table className="existing-variants-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Ürün Adı</th>
                  <th>Fiyat</th>
                  <th>Özet</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {existingVariants.map(v => (
                  <tr key={v.id}>
                    <td><code>{v.sku}</code></td>
                    <td>{v.name}</td>
                    <td>{v.price} ₺</td>
                    <td><small>{v.summary || '-'}</small></td>
                    <td>
                      <span className={`status-badge ${v.isActive ? 'active' : 'inactive'}`}>
                        {v.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SKU Builder - Her zaman göster */}
        <SkuBuilder
          masterProduct={{
            sku: formData.sku || 'SKU',
            name: formData.name || 'Ürün Adı',
            price: parseFloat(formData.price) || 0
          }}
          onVariantsChange={handleVariantsChange}
        />

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