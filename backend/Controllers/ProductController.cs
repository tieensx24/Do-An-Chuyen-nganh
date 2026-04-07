using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.IO;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;

    // Tiêm IWebHostEnvironment để xử lý đường dẫn lưu file
    public ProductController(AppDbContext db, IWebHostEnvironment env) 
    { 
        _db = db; 
        _env = env;
    }

    // GET api/product (Lấy tất cả sản phẩm)
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? categoryId)
    {
        var query = _db.Products.AsQueryable();

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        var products = await query
            .OrderBy(p => p.CategoryId)
            .ThenBy(p => p.Name)
            .ToListAsync();

        return Ok(products);
    }

    // --- ĐÂY LÀ HÀM VỪA ĐƯỢC THÊM VÀO ĐỂ SỬA LỖI ---
    // GET api/product/5 (Lấy chi tiết 1 sản phẩm)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var product = await _db.Products.FindAsync(id);
        
        if (product == null)
            return NotFound(new { message = "Không tìm thấy sản phẩm!" });

        return Ok(product);
    }
    // -----------------------------------------------

    // POST api/product — Thêm mới kèm Upload ảnh
    [HttpPost]
    public async Task<IActionResult> Create([FromForm] ProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name ?? "Sản phẩm không tên",
            Description = dto.Description,
            Price = dto.Price,
            StockQuantity = dto.StockQuantity,
            CategoryId = dto.CategoryId ?? 1, // Mặc định categoryId = 1 nếu null
            Brand = dto.Brand,
            Unit = dto.Unit,
            Image = dto.Image ?? "" // Mặc định link cũ nếu có
        };

        // Xử lý Upload file ảnh lấy trực tiếp từ dto.ImageFile
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            product.Image = await SaveImage(dto.ImageFile);
        }

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Thêm sản phẩm thành công!", productId = product.Id, imageUrl = product.Image });
    }

    // PUT api/product/5 — Cập nhật kèm Upload ảnh
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromForm] ProductDto dto)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound(new { message = "Không tìm thấy sản phẩm!" });

        product.Name = dto.Name ?? product.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.StockQuantity = dto.StockQuantity;
        product.CategoryId = dto.CategoryId ?? product.CategoryId;
        product.Brand = dto.Brand;
        product.Unit = dto.Unit;

        // Nếu người dùng chọn ảnh mới thì upload, không thì giữ link cũ (dto.Image)
        if (dto.ImageFile != null && dto.ImageFile.Length > 0)
        {
            product.Image = await SaveImage(dto.ImageFile);
        }
        else if (!string.IsNullOrEmpty(dto.Image))
        {
            product.Image = dto.Image;
        }

        await _db.SaveChangesAsync();
        return Ok(new { message = "Cập nhật thành công!", imageUrl = product.Image });
    }

    // DELETE api/product/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound(new { message = "Không tìm thấy sản phẩm!" });

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Xóa sản phẩm thành công!" });
    }

    // Hàm phụ xử lý lưu file vào wwwroot/uploads/products
    private async Task<string> SaveImage(IFormFile file)
    {
        // 1. Xác định đường dẫn thư mục lưu: wwwroot/uploads/products
        var wwwRootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadDir = Path.Combine(wwwRootPath, "uploads", "products");

        if (!Directory.Exists(uploadDir))
            Directory.CreateDirectory(uploadDir);

        // 2. Tạo tên file duy nhất để không bị trùng
        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
        var filePath = Path.Combine(uploadDir, fileName);

        // 3. Lưu file vào ổ cứng
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 4. Trả về đường dẫn tương đối để lưu vào DB
        return "/uploads/products/" + fileName;
    }
}

// Chuyển ProductDto thành Class, và thêm trực tiếp IFormFile vào đây
public class ProductDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int? CategoryId { get; set; }
    public string? Brand { get; set; }
    public string? Unit { get; set; }
    public string? Image { get; set; }
    
    // C# sẽ tự động map cái "ImageFile" từ FormData của React vào biến này
    public IFormFile? ImageFile { get; set; } 
}