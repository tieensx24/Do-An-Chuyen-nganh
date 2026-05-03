using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Helpers;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CouponController : ControllerBase
{
    private readonly AppDbContext _db;

    public CouponController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var coupons = await _db.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return Ok(coupons);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CouponDto dto)
    {
        var normalizedCode = dto.Code.Trim().ToUpperInvariant();
        var normalizedType = dto.Type.Trim().ToLowerInvariant();

        if (string.IsNullOrWhiteSpace(normalizedCode))
            return BadRequest(new { message = "Vui lòng nhập mã giảm giá." });

        if (normalizedType != "percent" && normalizedType != "fixed")
            return BadRequest(new { message = "Loại mã không hợp lệ." });

        if (dto.Value <= 0)
            return BadRequest(new { message = "Giá trị giảm phải lớn hơn 0." });

        if (normalizedType == "percent" && dto.Value > 100)
            return BadRequest(new { message = "Mã phần trăm không được vượt quá 100%." });

        if (dto.MinOrder < 0)
            return BadRequest(new { message = "Đơn tối thiểu không hợp lệ." });

        if (dto.MaxDiscount.HasValue && dto.MaxDiscount.Value <= 0)
            return BadRequest(new { message = "Giảm tối đa phải lớn hơn 0." });

        if (dto.UsageLimit.HasValue && dto.UsageLimit.Value <= 0)
            return BadRequest(new { message = "Giới hạn lượt dùng phải lớn hơn 0." });

        if (dto.EndDate <= dto.StartDate)
            return BadRequest(new { message = "Ngày kết thúc phải sau ngày bắt đầu." });

        if (await _db.Coupons.AnyAsync(c => c.Code.ToLower() == normalizedCode.ToLower()))
            return BadRequest(new { message = "Mã giảm giá đã tồn tại." });

        var coupon = new Coupon
        {
            Code = normalizedCode,
            Type = normalizedType,
            Value = dto.Value,
            MinOrder = dto.MinOrder,
            MaxDiscount = dto.MaxDiscount,
            UsageLimit = dto.UsageLimit,
            UsedCount = 0,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.Now,
        };

        _db.Coupons.Add(coupon);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Tạo mã giảm giá thành công!", couponId = coupon.Id });
    }

    [HttpPost("validate")]
    public async Task<IActionResult> Validate([FromBody] CouponValidateDto dto)
    {
        var normalizedCode = dto.Code.Trim().ToUpperInvariant();

        if (string.IsNullOrWhiteSpace(normalizedCode))
            return BadRequest(new { message = "Vui lòng nhập mã giảm giá." });

        if (dto.Subtotal <= 0)
            return BadRequest(new { message = "Giỏ hàng chưa hợp lệ để áp mã." });

        var coupon = await _db.Coupons.FirstOrDefaultAsync(c => c.Code.ToUpper() == normalizedCode);
        if (coupon == null)
            return NotFound(new { message = "Không tìm thấy mã giảm giá." });

        var validationError = CouponHelper.ValidateCoupon(coupon, dto.Subtotal, DateTime.Now);
        if (validationError != null)
            return BadRequest(new { message = validationError });

        var discountAmount = CouponHelper.CalculateDiscount(coupon, dto.Subtotal);
        var finalTotal = dto.Subtotal - discountAmount;

        return Ok(new
        {
            message = "Áp dụng mã giảm giá thành công!",
            discountAmount,
            finalTotal,
            coupon = new
            {
                coupon.Id,
                coupon.Code,
                coupon.Type,
                coupon.Value,
                coupon.MinOrder,
                coupon.MaxDiscount,
                coupon.UsageLimit,
                coupon.UsedCount,
                coupon.StartDate,
                coupon.EndDate,
                coupon.IsActive
            }
        });
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] bool isActive)
    {
        var coupon = await _db.Coupons.FindAsync(id);
        if (coupon == null)
            return NotFound(new { message = "Không tìm thấy mã giảm giá." });

        coupon.IsActive = isActive;
        await _db.SaveChangesAsync();

        return Ok(new { message = "Đã cập nhật trạng thái mã giảm giá." });
    }
}

public class CouponDto
{
    public string Code { get; set; } = "";
    public string Type { get; set; } = "fixed";
    public decimal Value { get; set; }
    public decimal MinOrder { get; set; }
    public decimal? MaxDiscount { get; set; }
    public int? UsageLimit { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; } = true;
}

public class CouponValidateDto
{
    public string Code { get; set; } = "";
    public decimal Subtotal { get; set; }
}
