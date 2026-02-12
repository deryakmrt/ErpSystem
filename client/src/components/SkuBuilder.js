import React, { useState, useEffect } from 'react';
import './SkuBuilder.css';

/**
 * SKU Builder Component
 * Ürün varyasyonları oluşturmak için kullanılır
 * Örnek: AR-A (ana ürün) → AR-A-030-56, AR-A-060-65 (varyasyonlar)
 */
const SkuBuilder = ({ masterProduct, onVariantsChange }) => {
  // ========== STATE ==========
  
  // Özellik havuzu (Attribute Pool)
  const [attributePool] = useState({
    watt: {
      label: 'Güç (Watt)',
      options: ['10W', '15W', '20W', '30W', '40W', '50W', '60W']
    },
    kelvin: {
      label: 'Işık Rengi (Kelvin)',
      options: ['3000K (Günışığı)', '4000K (Doğal Beyaz)', '5000K (Beyaz)', '6500K (Soğuk Beyaz)']
    },
    color: {
      label: 'Gövde Rengi',
      options: ['Beyaz', 'Siyah', 'Gri', 'Krom']
    },
    length: {
      label: 'Uzunluk (cm)',
      options: ['30cm', '60cm', '90cm', '120cm', '150cm']
    },
    width: {
      label: 'Genişlik (cm)',
      options: ['10cm', '15cm', '20cm', '30cm']
    }
  });

  // SKU Tarifi (Recipe) - Hangi özellikler kullanılacak?
  const [skuRecipe, setSkuRecipe] = useState([
    { type: 'watt', label: 'Güç' },
    { type: 'kelvin', label: 'Işık Rengi' }
  ]);

  // Wizard durumu
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardData, setWizardData] = useState({});
  const [wizardPreview, setWizardPreview] = useState({ sku: '', name: '' });

  // Oluşturulan varyasyonlar
  const [variants, setVariants] = useState([]);

  // ========== FUNCTIONS ==========

  // Özellik ekle (Recipe'ye)
  const addAttributeToRecipe = (type) => {
    const attr = attributePool[type];
    if (!attr) return;

    const exists = skuRecipe.find(r => r.type === type);
    if (exists) {
      alert('Bu özellik zaten eklenmiş!');
      return;
    }

    setSkuRecipe([...skuRecipe, { type, label: attr.label }]);
  };

  // Özellik çıkar (Recipe'den)
  const removeFromRecipe = (type) => {
    setSkuRecipe(skuRecipe.filter(r => r.type !== type));
  };

  // Recipe sırasını değiştir
  const moveRecipeItem = (index, direction) => {
    const newRecipe = [...skuRecipe];
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= newRecipe.length) return;

    [newRecipe[index], newRecipe[targetIndex]] = [newRecipe[targetIndex], newRecipe[index]];
    setSkuRecipe(newRecipe);
  };

  // Wizard'ı aç
  const openWizard = () => {
    // State'leri tamamen sıfırla
    setWizardData({});
    setWizardPreview({ 
      sku: masterProduct.sku, 
      name: masterProduct.name 
    });
    setWizardOpen(true);
  };

  // Wizard input değişikliği
  const handleWizardChange = (type, value) => {
    const newData = { ...wizardData, [type]: value };
    setWizardData(newData);
    updateWizardPreview(newData);
  };

  // Wizard preview güncelle
  const updateWizardPreview = (data) => {
    let sku = masterProduct.sku;
    let name = masterProduct.name;

    skuRecipe.forEach(item => {
      const value = data[item.type];
      if (value) {
        // SKU kodu oluştur
        const code = generateCode(item.type, value);
        sku += `-${code}`;
        
        // İsme ekle
        name += ` ${value}`;
      }
    });

    setWizardPreview({ sku, name });
  };

  // Özellik değerine göre kod oluştur
  const generateCode = (type, value) => {
    // Sayı varsa çıkar (10W → 010, 3000K → 30)
    const match = value.match(/\d+/);
    if (match) {
      const num = match[0];
      if (type === 'watt') return num.padStart(3, '0'); // 10 → 010
      if (type === 'kelvin') return num.substring(0, 2); // 3000 → 30
      return num;
    }

    // Parantez içi kod varsa kullan
    const parenMatch = value.match(/\((.*?)\)/);
    if (parenMatch) return parenMatch[1];

    // Yoksa ilk 3 harfi al
    return value.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  };

  // Varyasyon ekle
  const addVariantFromWizard = () => {
    // Validasyon
    for (const item of skuRecipe) {
      if (!wizardData[item.type]) {
        alert(`Lütfen ${item.label} seçin!`);
        return;
      }
    }

    // Duplicate SKU kontrolü
    const isDuplicate = variants.some(v => v.sku === wizardPreview.sku);
    if (isDuplicate) {
      alert(`⚠️ SKU "${wizardPreview.sku}" zaten eklenmiş! Farklı bir kombinasyon seçin.`);
      return;
    }

    const newVariant = {
      id: Date.now(), // Temporary ID
      sku: wizardPreview.sku,
      name: wizardPreview.name,
      price: masterProduct.price,
      summary: Object.values(wizardData).join(', '),
      stockQuantity: 0,
      isActive: true
    };

    const updatedVariants = [...variants, newVariant];
    setVariants(updatedVariants);
    
    // Parent'a bildir
    if (onVariantsChange) {
      onVariantsChange(updatedVariants);
    }

    // Wizard'ı kapat
    setWizardOpen(false);
    setWizardData({});
  };

  // Varyasyon sil
  const removeVariant = (id) => {
    if (!window.confirm('Bu varyasyonu silmek istediğinize emin misiniz?')) return;
    
    const updatedVariants = variants.filter(v => v.id !== id);
    setVariants(updatedVariants);
    
    if (onVariantsChange) {
      onVariantsChange(updatedVariants);
    }
  };

  // ========== RENDER ==========

  return (
    <div className="sku-builder">
      <h3>🔧 SKU Yapılandırma</h3>
      
      {/* SKU Recipe Builder */}
      <div className="sku-recipe-section">
        <div className="recipe-header">
          <h4>Varyasyon Tarifi</h4>
          <p className="recipe-help">
            Aşağıdan özellik ekleyerek varyasyon tarifini oluşturun.
            Sıralama önemlidir: SKU kodu bu sırayla oluşturulacaktır.
          </p>
        </div>

        <div className="recipe-builder">
          {/* Attribute Pool */}
          <div className="attribute-pool">
            <h5>Özellikler Havuzu</h5>
            {Object.entries(attributePool).map(([type, attr]) => (
              <button
                key={type}
                type="button"
                className="attr-btn"
                onClick={() => addAttributeToRecipe(type)}
                disabled={skuRecipe.some(r => r.type === type)}
              >
                ➕ {attr.label}
              </button>
            ))}
          </div>

          {/* Recipe List */}
          <div className="recipe-list">
            <h5>Tarif ({skuRecipe.length} özellik)</h5>
            {skuRecipe.length === 0 ? (
              <p className="empty-recipe">Henüz özellik eklenmedi</p>
            ) : (
              <ul>
                {skuRecipe.map((item, index) => (
                  <li key={item.type} className="recipe-item">
                    <span className="recipe-index">{index + 1}</span>
                    <span className="recipe-label">{item.label}</span>
                    <div className="recipe-actions">
                      <button
                        type="button"
                        onClick={() => moveRecipeItem(index, -1)}
                        disabled={index === 0}
                        title="Yukarı"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRecipeItem(index, 1)}
                        disabled={index === skuRecipe.length - 1}
                        title="Aşağı"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromRecipe(item.type)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Variant Wizard Button */}
      <div className="wizard-section">
        <button
          type="button"
          className="btn-wizard"
          onClick={openWizard}
          disabled={skuRecipe.length === 0}
        >
          ✨ Varyasyon Oluştur
        </button>
        {skuRecipe.length === 0 && (
          <p className="wizard-help">Önce yukarıdan tarif oluşturun</p>
        )}
      </div>

      {/* Variants Table */}
      {variants.length > 0 && (
        <div className="variants-table">
          <h4>Oluşturulan Varyasyonlar ({variants.length})</h4>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Ürün Adı</th>
                <th>Fiyat</th>
                <th>Özet</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {variants.map(variant => (
                <tr key={variant.id}>
                  <td><code>{variant.sku}</code></td>
                  <td>{variant.name}</td>
                  <td>{variant.price} ₺</td>
                  <td>{variant.summary}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      className="btn-delete"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wizard Modal */}
      {wizardOpen && (
        <div className="wizard-modal">
          <div className="wizard-content">
            <div className="wizard-header">
              <h3>Varyasyon Oluştur</h3>
              <button type="button" onClick={() => setWizardOpen(false)}>×</button>
            </div>

            <div className="wizard-body">
              {skuRecipe.map(item => {
                const attr = attributePool[item.type];
                return (
                  <div key={item.type} className="wizard-field">
                    <label>{item.label}</label>
                    <select
                      value={wizardData[item.type] || ''}
                      onChange={(e) => handleWizardChange(item.type, e.target.value)}
                    >
                      <option value="">Seçiniz...</option>
                      {attr.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                );
              })}

              {/* Preview */}
              <div className="wizard-preview">
                <h4>Önizleme</h4>
                <div className="preview-item">
                  <strong>SKU:</strong> <code>{wizardPreview.sku}</code>
                </div>
                <div className="preview-item">
                  <strong>Ürün Adı:</strong> {wizardPreview.name}
                </div>
              </div>
            </div>

            <div className="wizard-footer">
              <button type="button" className="btn-cancel" onClick={() => setWizardOpen(false)}>
                İptal
              </button>
              <button type="button" className="btn-add" onClick={addVariantFromWizard}>
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkuBuilder;