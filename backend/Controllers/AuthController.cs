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
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
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
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
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
    } // <--- ĐÓNG NGOẶC CỦA HÀM LOGIN Ở ĐÂY

    // HÀM MỚI NẰM ĐỘC LẬP BÊN NGOÀI
    [HttpGet("/api/user")] 
    public async Task<IActionResult> GetAllUsers()
    {
        // Lấy toàn bộ danh sách user từ bảng Users trong Database
        var users = await _db.Users.ToListAsync();
        
        // Trả về dữ liệu với mã 200 OK
        return Ok(users);
    }
} // <--- ĐÓNG NGOẶC CỦA CLASS AUTHCONTROLLER

public record RegisterDto(string FullName, string Email, string Password);
public record LoginDto(string Email, string Password);