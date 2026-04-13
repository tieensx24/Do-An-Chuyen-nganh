using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    public AuthController(AppDbContext db) { _db = db; }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "Email đã được sử dụng!" });

        var user = new User
        {
            Email        = dto.Email,
            FullName     = dto.FullName,
            Phone        = dto.Phone, // <--- THÊM NHẬN SỐ ĐIỆN THOẠI Ở ĐÂY
            // TẮT BĂM: Lưu trực tiếp mật khẩu từ người dùng nhập
            PasswordHash = dto.Password, 
            Role         = "user",
            IsActive     = true,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đăng ký thành công!", userId = user.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        // 1. Tìm user theo Email
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        // 2. TẮT VERIFY: So sánh trực tiếp chuỗi mật khẩu trong DB với mật khẩu nhập vào
        if (user == null || user.PasswordHash != dto.Password)
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng!" });

        if (!user.IsActive)
            return Unauthorized(new { message = "Tài khoản đã bị khóa!" });

        return Ok(new {
            message  = "Đăng nhập thành công!",
            userId   = user.Id,
            fullName = user.FullName,
            email    = user.Email,
            role     = user.Role,
        });
    }

    [HttpGet("/api/user")] 
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _db.Users.ToListAsync();
        return Ok(users);
    }
}

// <--- THÊM 'string Phone' VÀO DÒNG NÀY
public record RegisterDto(string FullName, string Email, string Phone, string Password);
public record LoginDto(string Email, string Password);