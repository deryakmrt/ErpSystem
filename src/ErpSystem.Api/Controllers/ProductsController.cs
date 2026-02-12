using ErpSystem.Application.DTOs;
using ErpSystem.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ErpSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        IProductRepository productRepository,
        ILogger<ProductsController> logger)
    {
        _productRepository = productRepository;
        _logger = logger;
    }

    // GET: api/products
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductDto>>> GetAll()
    {
        try
        {
            var products = await _productRepository.GetAllAsync();
            return Ok(products);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all products");
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/products/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        try
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound($"Product with ID {id} not found");

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting product {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/products/code/{code}
    [HttpGet("code/{code}")]
    public async Task<ActionResult<ProductDto>> GetByCode(string code)
    {
        try
        {
            var product = await _productRepository.GetByCodeAsync(code);
            if (product == null)
                return NotFound($"Product with code {code} not found");

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting product by code {Code}", code);
            return StatusCode(500, "Internal server error");
        }
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kod kontrolü
            var existingProduct = await _productRepository.GetByCodeAsync(dto.Code);
            if (existingProduct != null)
                return Conflict($"Product with code {dto.Code} already exists");

            var product = await _productRepository.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product");
            return StatusCode(500, "Internal server error");
        }
    }

    // PUT: api/products/{id}
    [HttpPut("{id}")]
    public async Task<ActionResult<ProductDto>> Update(int id, [FromBody] UpdateProductDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var product = await _productRepository.UpdateAsync(id, dto);
            if (product == null)
                return NotFound($"Product with ID {id} not found");

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // DELETE: api/products/{id}
    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        try
        {
            var result = await _productRepository.DeleteAsync(id);
            if (!result)
                return NotFound($"Product with ID {id} not found");

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // GET: api/products/{id}/variants
    [HttpGet("{id}/variants")]
    public async Task<ActionResult<IEnumerable<ProductVariantDto>>> GetVariants(int id)
    {
        try
        {
            // Önce ürünün var olduğunu kontrol et
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
                return NotFound($"Product with ID {id} not found");

            var variants = await _productRepository.GetVariantsAsync(id);
            return Ok(variants);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting variants for product {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    // PUT: api/products/{id}/sku-config
    [HttpPut("{id}/sku-config")]
    public async Task<ActionResult<ProductDto>> UpdateSkuConfig(int id, [FromBody] string skuConfig)
    {
        try
        {
            var product = await _productRepository.UpdateSkuConfigAsync(id, skuConfig);
            if (product == null)
                return NotFound($"Product with ID {id} not found");

            return Ok(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating SKU config for product {ProductId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}