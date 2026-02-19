using Microsoft.AspNetCore.Mvc;
using ErpSystem.Application.DTOs;
using ErpSystem.Application.Interfaces;

namespace ErpSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductAttributesController : ControllerBase
{
    private readonly IProductAttributeRepository _repository;

    public ProductAttributesController(IProductAttributeRepository repository)
    {
        _repository = repository;
    }

    // GET: api/ProductAttributes (Sabit kriterleri React'a gönderir)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductAttributeDto>>> GetAttributes()
    {
        var attributes = await _repository.GetAllAsync();
        return Ok(attributes);
    }

    // POST: api/ProductAttributes (React'tan gelen yeni kriteri veritabanına kaydeder)
    [HttpPost]
    public async Task<ActionResult<ProductAttributeDto>> CreateAttribute([FromBody] ProductAttributeDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || !dto.Options.Any())
        {
            return BadRequest(new { message = "Geçersiz kriter verisi. İsim ve değerler boş olamaz." });
        }

        try
        {
            var createdAttribute = await _repository.CreateAsync(dto);
            // 201 Created döndürür
            return CreatedAtAction(nameof(GetAttributes), new { id = createdAttribute.Id }, createdAttribute); 
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Kriter kaydedilirken sunucu hatası oluştu.", error = ex.Message });
        }
    }
    // 👇 YENİ: GET - Tek bir kriteri ID ile getirir
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductAttributeDto>> GetAttribute(int id)
    {
        var attribute = await _repository.GetByIdAsync(id);
        if (attribute == null) return NotFound(new { message = "Kriter bulunamadı." });
        
        return Ok(attribute);
    }

    // 👇 YENİ: PUT - Var olan bir kriteri günceller (Adını veya seçeneklerini değiştirir)
    [HttpPut("{id}")]
    public async Task<ActionResult<ProductAttributeDto>> UpdateAttribute(int id, [FromBody] ProductAttributeDto dto)
    {
        if (dto == null || string.IsNullOrWhiteSpace(dto.Name) || !dto.Options.Any())
        {
            return BadRequest(new { message = "Geçersiz kriter verisi." });
        }

        try
        {
            var updatedAttribute = await _repository.UpdateAsync(id, dto);
            return Ok(updatedAttribute);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Kriter güncellenirken hata oluştu.", error = ex.Message });
        }
    }

    // 👇 YENİ: DELETE - Kriteri siler (Pasife çeker)
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAttribute(int id)
    {
        var result = await _repository.DeleteAsync(id);
        if (!result) return NotFound(new { message = "Silinecek kriter bulunamadı." });

        return Ok(new { message = "Kriter başarıyla silindi." });
    }
    [HttpPost("{id}/restore")]
    public async Task<IActionResult> RestoreAttribute(int id)
    {
        var result = await _repository.RestoreAsync(id);
        if (!result) return NotFound();
        return Ok(new { message = "Kriter geri yüklendi." });
    }
}