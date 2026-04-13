using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _db;
    public CategoryController(AppDbContext db) { _db = db; }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _db.Categories.ToListAsync();
        return Ok(categories);
    }
}