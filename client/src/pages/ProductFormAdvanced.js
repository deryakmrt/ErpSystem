import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductById, getProductVariants } from '../services/productService';
import './ProductFormAdvanced.css';

const ProductFormAdvanced = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Active Tab
  const [activeTab, setActiveTab] = useState('general');

  // Form Data
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: '',
    unit: 'Adet',
    category: '',
    image: null,
    imagePreview: null,
    isActive: true
  });

  // SKU Recipe (Kriter Elde)
  const [attributePool] = useState({
    light_color: {
      label: 'Işık Rengi',
      options: ['3000K (Günışığı)', '4000K (Doğal Beyaz)', '6500K (Soğuk Beyaz)']
    },
    ip_class: {
      label: 'IP Sınıfı',
      options: ['IP20', 'IP40', 'IP54', 'IP65']
    },
    power: {
      label: 'Tüketim Gücü',
      options: ['18W', '30W', '40W', '60W']
    },
    length: {
      label: 'Uzunluk',
      options: ['60cm', '90cm', '120cm', '150cm', '200cm']
    },
    diffuser: {
      label: 'Difüzör Tipi',
      options: ['Opak', 'Şeffaf', 'Buzlu']
    }
  });

  const [skuRecipe, setSkuRecipe] = useState([]);
  const [recipeOptions, setRecipeOptions] = useState({});

  // Variants
  const [variants, setVariants] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardData, setWizardData] = useState({});
  const [wizardPreview, setWizardPreview] = useState({ sku: '', name: '' });
  const [manualCode, setManualCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load product in edit mode
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
        sku: product.code || '',
        name: product.name || '',
        description: product.description || '',
        price: (product.basePrice || 0).toString(),
        unit: product.unit || 'Adet',
        category: product.category || '',
        image: null,
        imagePreview: product.imageUrl || null,
        isActive: product.isActive
      });

      // Load SKU Config
      if (product.skuConfig) {
        try {
          const config = JSON.parse(product.skuConfig);
          setSkuRecipe(config);
        } catch (e) {
          console.error('SKU Config parse error:', e);
        }
      }

      setError(null);
    } catch (err) {
      setError('Ürün yüklenirken hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingVariants = async () => {
    try {
      const variantData = await getProductVariants(id);
      setVariants(variantData.map(v => ({
        ...v,
        isExisting: true // Mark as existing
      })));
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  // ========== SKU RECIPE MANAGEMENT ==========

  const addToRecipe = (attrType) => {
    if (skuRecipe.find(r => r.type === attrType)) {
      alert('Bu özellik zaten eklenmiş!');
      return;
    }

    const attr = attributePool[attrType];
    setSkuRecipe([...skuRecipe, { 
      type: attrType, 
      label: attr.label 
    }]);

    // Initialize options for this attribute
    setRecipeOptions(prev => ({
      ...prev,
      [attrType]: attr.options
    }));
  };

  const removeFromRecipe = (attrType) => {
    setSkuRecipe(skuRecipe.filter(r => r.type !== attrType));
    
    // Remove options
    const newOptions = { ...recipeOptions };
    delete newOptions[attrType];
    setRecipeOptions(newOptions);
  };

  const moveRecipeItem = (index, direction) => {
    const newRecipe = [...skuRecipe];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newRecipe.length) return;

    [newRecipe[index], newRecipe[targetIndex]] = [newRecipe[targetIndex], newRecipe[index]];
    setSkuRecipe(newRecipe);
  };

  // Add option to attribute
  const addOptionToAttribute = (attrType, newOption) => {
    if (!newOption.trim()) return;

    setRecipeOptions(prev => ({
      ...prev,
      [attrType]: [...(prev[attrType] || []), newOption]
    }));
  };

  // ========== WIZARD ==========

  const openWizard = () => {
    setWizardData({});
    setManualCode('');
    setWizardPreview({ 
      sku: formData.sku, 
      name: formData.name 
    });
    setWizardOpen(true);
  };

  const handleWizardChange = (type, value) => {
    const newData = { ...wizardData, [type]: value };
    setWizardData(newData);
    updateWizardPreview(newData);
  };

  const updateWizardPreview = (data) => {
    let sku = formData.sku;
    let name = formData.name;

    skuRecipe.forEach(item => {
      const value = data[item.type];
      if (value) {
        const code = generateCode(item.type, value);
        sku += `-${code}`;
        name += ` ${value}`;
      }
    });

    if (manualCode) {
      sku += `-${manualCode}`;
    }

    setWizardPreview({ sku, name });
  };

  const generateCode = (type, value) => {
    // Extract numbers
    const match = value.match(/\d+/);
    if (match) {
      const num = match[0];
      if (type === 'power') return num.padStart(2, '0'); // 18W → 18
      if (type === 'light_color') return num.substring(0, 2); // 3000K → 30
      if (type === 'length') return num.padStart(3, '0'); // 60cm → 060
      return num;
    }

    // Extract parentheses code
    const parenMatch = value.match(/\((.*?)\)/);
    if (parenMatch) return parenMatch[1];

    // First 2-3 chars uppercase
    return value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 2).toUpperCase();
  };

  const addVariantFromWizard = () => {
    // Validation
    for (const item of skuRecipe) {
      if (!wizardData[item.type]) {
        alert(`Lütfen ${item.label} seçin!`);
        return;
      }
    }

    // Duplicate check
    const isDuplicate = variants.some(v => v.sku === wizardPreview.sku);
    if (isDuplicate) {
      alert(`⚠️ SKU "${wizardPreview.sku}" zaten mevcut!`);
      return;
    }

    const newVariant = {
      id: `temp-${Date.now()}`,
      sku: wizardPreview.sku,
      name: wizardPreview.name,
      price: parseFloat(formData.price) || 0,
      summary: Object.entries(wizardData).map(([k, v]) => v).join(', '),
      isActive: true,
      isExisting: false // New variant
    };

    setVariants([...variants, newVariant]);
    setWizardOpen(false);
  };

  const removeVariant = (variantId) => {
    if (!window.confirm('Bu varyasyonu silmek istediğinize emin misiniz?')) return;
    setVariants(variants.filter(v => v.id !== variantId));
  };

  // ========== SUBMIT ==========

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name || !formData.price) {
      setError('Lütfen zorunlu alanları doldurun!');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const productData = {
        code: formData.sku,
        name: formData.name,
        description: formData.description || null,
        basePrice: parseFloat(formData.price),
        unit: formData.unit,
        category: formData.category || null,
        isActive: formData.isActive,
        skuConfig: JSON.stringify(skuRecipe),
        parentId: null
      };

      let createdProduct;

      if (isEditMode) {
        await updateProduct(id, productData);
        
        // Add new variants
        const newVariants = variants.filter(v => !v.isExisting);
        if (newVariants.length > 0) {
          for (const variant of newVariants) {
            const variantData = {
              code: variant.sku,
              name: variant.name,
              basePrice: variant.price,
              unit: formData.unit,
              category: formData.category,
              isActive: variant.isActive,
              parentId: parseInt(id),
              summary: variant.summary
            };
            
            await createProduct(variantData);
          }
          alert(`✅ Ürün güncellendi ve ${newVariants.length} yeni varyasyon eklendi!`);
        } else {
          alert('✅ Ürün başarıyla güncellendi!');
        }
        
        navigate('/');
      } else {
        createdProduct = await createProduct(productData);
        
        if (variants.length > 0) {
          for (const variant of variants) {
            const variantData = {
              code: variant.sku,
              name: variant.name,
              basePrice: variant.price,
              unit: formData.unit,
              category: formData.category,
              isActive: variant.isActive,
              parentId: createdProduct.id,
              summary: variant.summary
            };
            
            await createProduct(variantData);
          }
          alert(`✅ Ürün ve ${variants.length} varyasyon başarıyla eklendi!`);
        } else {
          alert('✅ Ürün başarıyla eklendi!');
        }
        
        navigate('/');
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
    <div className="product-form-advanced">
      {/* Header */}
      <div className="form-header">
        <div>
          <h1>Ürün Düzenle: {formData.name || 'Yeni Ürün'}</h1>
          <p className="subtitle">Gelişmiş ürün yapılandırıcı</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate('/')}>
            ✕ VAZGEÇ
          </button>
          <button type="button" className="btn-save" onClick={handleSubmit} disabled={loading}>
            💾 KAYDET
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button
          type="button"
          className={`tab ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          🎨 Genel Bilgiler
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'variants' ? 'active' : ''}`}
          onClick={() => setActiveTab('variants')}
        >
          🧙 Varyasyon Sihirbazı ({variants.length})
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* TAB 1: GENEL BİLGİLER */}
        {activeTab === 'general' && (
          <div className="tab-content">
            {/* Rest of the form continues... */}
            <div className="form-grid">
              {/* Left Column */}
              <div className="form-column">
                <div className="form-section">
                  <h3>Ürün Adı (Ana Model)</h3>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Canna Sarkit Lineer Armatür"
                    required
                  />
                </div>

                <div className="form-section">
                  <h3>Kök SKU (Model Kodu)</h3>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    placeholder="RN-CNN SR"
                    disabled={isEditMode}
                    required
                  />
                </div>

                <div className="form-section">
                  <h3>Kategori</h3>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    <option value="">-- Seçiniz --</option>
                    <option value="Aydinlatma">Aydınlatma</option>
                    <option value="Armatur">Armatür</option>
                    <option value="Panel">Panel</option>
                  </select>
                </div>

                {/* SKU Recipe */}
                <div className="form-section sku-recipe-section">
                  <h3>⭐ Ana SKU Tarifi (Sabit)</h3>
                  <p className="help-text">Bu ürün için bir kez ayarlanır, otomatik kaydedilir.</p>

                  <div className="recipe-builder">
                    <div className="recipe-pool">
                      <h4>➕ Kriter Ekle</h4>
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            addToRecipe(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      >
                        <option value="">Tüketim Gücü</option>
                        {Object.entries(attributePool).map(([key, attr]) => (
                          <option key={key} value={key}>{attr.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="recipe-list">
                      <h4>📋 Aktif Kodlama Sırası</h4>
                      {skuRecipe.length === 0 ? (
                        <p className="empty-state">Henüz kriter eklenmedi</p>
                      ) : (
                        <ul>
                          {skuRecipe.map((item, index) => (
                            <li key={item.type}>
                              <span className="recipe-num">{index + 1}</span>
                              <span className="recipe-label">{item.label}</span>
                              <div className="recipe-actions">
                                <button type="button" onClick={() => moveRecipeItem(index, -1)} disabled={index === 0}>↑</button>
                                <button type="button" onClick={() => moveRecipeItem(index, 1)} disabled={index === skuRecipe.length - 1}>↓</button>
                                <button type="button" onClick={() => removeFromRecipe(item.type)} className="btn-remove">×</button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Ürün Özet Şablonu</h3>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Ürün açıklaması..."
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="form-column">
                <div className="form-section image-section">
                  <h3>Ürün Görseli</h3>
                  <div className="image-upload">
                    {formData.imagePreview ? (
                      <div className="image-preview">
                        <img src={formData.imagePreview} alt="Preview" />
                        <button type="button" className="btn-remove-image" onClick={() => setFormData(prev => ({...prev, image: null, imagePreview: null}))}>
                          🗑️
                        </button>
                      </div>
                    ) : (
                      <div className="image-placeholder">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          id="imageInput"
                          style={{display: 'none'}}
                        />
                        <label htmlFor="imageInput" className="upload-label">
                          <span>📁 Dosya Seç</span>
                          <small>veya sürükle/bırak</small>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-section">
                    <h3>Birim</h3>
                    <select name="unit" value={formData.unit} onChange={handleChange}>
                      <option value="Adet">Adet</option>
                      <option value="Kutu">Kutu</option>
                      <option value="Metre">Metre</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VARYASYON SİHİRBAZI */}
        {activeTab === 'variants' && (
          <div className="tab-content">
            <div className="variants-wizard">
              <div className="wizard-help">
                <h3>🧙 Varyasyon Sihirbazı</h3>
                <p>Genel Bilgiler sekmesinde oluşturduğunuz tarife göre alanlar aşağıda listelenir.</p>
              </div>

              {skuRecipe.length === 0 ? (
                <div className="empty-wizard">
                  <p>⚠️ Önce "Genel Bilgiler" sekmesinden SKU tarifi oluşturun!</p>
                </div>
              ) : (
                <>
                  {/* Wizard Form */}
                  <div className="wizard-form">
                    {skuRecipe.map(item => (
                      <div key={item.type} className="wizard-field">
                        <label>{item.label}</label>
                        <select
                          value={wizardData[item.type] || ''}
                          onChange={(e) => handleWizardChange(item.type, e.target.value)}
                        >
                          <option value="">Seçiniz...</option>
                          {(recipeOptions[item.type] || []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}

                    <div className="wizard-field">
                      <label>Ek Kod</label>
                      <input
                        type="text"
                        value={manualCode}
                        onChange={(e) => {
                          setManualCode(e.target.value);
                          updateWizardPreview(wizardData);
                        }}
                        placeholder="-EK"
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="wizard-preview">
                    <h4>OLUŞACAK KOD VE İSİM:</h4>
                    <div className="preview-sku">
                      <strong>SKU:</strong> <code>{wizardPreview.sku}</code>
                    </div>
                    <div className="preview-name">
                      <strong>İsim:</strong> {wizardPreview.name}
                    </div>
                  </div>

                  <button type="button" className="btn-add-variant" onClick={addVariantFromWizard}>
                    📦 EKLE
                  </button>

                  {/* Variants Table */}
                  {variants.length > 0 && (
                    <div className="variants-table">
                      <h4># Varyasyon Adı SKU Fiyat İşlemler</h4>
                      <table>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Varyasyon Adı</th>
                            <th>Varyasyon SKU</th>
                            <th>Fiyat</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {variants.map((variant, index) => (
                            <tr key={variant.id}>
                              <td>
                                {variant.isExisting ? (
                                  <span className="badge-existing">📦 {variant.id}</span>
                                ) : (
                                  <span className="badge-new">🆕 {index + 1}</span>
                                )}
                              </td>
                              <td>{variant.name}</td>
                              <td><code>{variant.sku}</code></td>
                              <td>{variant.price.toFixed(2)} ₺</td>
                              <td>
                                <div className="action-btns">
                                  <button type="button" className="btn-detail">📋 Detay</button>
                                  <button type="button" className="btn-edit">🖊 Ayır</button>
                                  <button type="button" className="btn-delete" onClick={() => removeVariant(variant.id)}>🗑 Sil</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProductFormAdvanced;