using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Text.RegularExpressions;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;

    public AuthController(AppDbContext db)
    {
        _db = db;
    }

    private static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    private static string NormalizePhone(string? phone) =>
        Regex.Replace(phone ?? string.Empty, "[^0-9]", "");

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var normalizedEmail = NormalizeEmail(dto.Email);

        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == normalizedEmail))
            return BadRequest(new { message = "Email đã được sử dụng!" });

        var user = new User
        {
            Email = dto.Email.Trim(),
            FullName = dto.FullName,
            Phone = dto.Phone,
            PasswordHash = dto.Password,
            Role = "user",
            IsActive = true,
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đăng ký thành công!", userId = user.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var normalizedEmail = NormalizeEmail(dto.Email);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null || user.PasswordHash != dto.Password)
            return Unauthorized(new { message = "Email hoặc mật khẩu không đúng!" });

        if (!user.IsActive)
            return Unauthorized(new { message = "Tài khoản đã bị khóa!" });

        return Ok(new
        {
            message = "Đăng nhập thành công!",
            userId = user.Id,
            fullName = user.FullName,
            email = user.Email,
            phone = user.Phone,
            avatar = user.Avatar,
            role = user.Role,
        });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var normalizedEmail = NormalizeEmail(dto.Email);
        var normalizedPhone = NormalizePhone(dto.Phone);

        if (string.IsNullOrWhiteSpace(normalizedPhone))
            return BadRequest(new { message = "Vui lòng nhập số điện thoại đã đăng ký." });

        if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 8)
            return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 8 ký tự." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null || NormalizePhone(user.Phone) != normalizedPhone)
            return BadRequest(new { message = "Email hoặc số điện thoại không khớp tài khoản." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Tài khoản đã bị khóa!" });

        user.PasswordHash = dto.NewPassword;
        user.UpdatedAt = DateTime.Now;

        await _db.SaveChangesAsync();

        return Ok(new { message = "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." });
    }
}

public record RegisterDto(string FullName, string Email, string Phone, string Password);
public record LoginDto(string Email, string Password);
public record ForgotPasswordDto(string Email, string Phone, string NewPassword);
