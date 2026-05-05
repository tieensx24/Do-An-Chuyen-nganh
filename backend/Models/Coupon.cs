using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

// Map class này với bảng "coupons" trong database
[Table("coupons")]
public class Coupon
{
    // ID chính của coupon
    [Column("id")]
    public int Id { get; set; }

    // Mã coupon (VD: SALE10, FREESHIP...)
    [Column("code")]
    public string Code { get; set; } = "";

    // Loại coupon: "fixed" (giảm tiền cố định) hoặc "percent" (giảm theo %)
    [Column("type")]
    public string Type { get; set; } = "fixed";

    // Giá trị giảm (VD: 10% hoặc 50k)
    [Column("value")]
    public decimal Value { get; set; }

    // Giá trị đơn hàng tối thiểu để áp dụng coupon
    [Column("min_order")]
    public decimal MinOrder { get; set; }

    // Số tiền giảm tối đa (chỉ dùng cho loại percent), có thể null
    [Column("max_discount")]
    public decimal? MaxDiscount { get; set; }

    // Số lần tối đa coupon được sử dụng (null = không giới hạn)
    [Column("usage_limit")]
    public int? UsageLimit { get; set; }

    // Số lần đã sử dụng coupon
    [Column("used_count")]
    public int UsedCount { get; set; }

    // Ngày bắt đầu hiệu lực của coupon
    [Column("start_date")]
    public DateTime StartDate { get; set; }

    // Ngày hết hạn coupon
    [Column("end_date")]
    public DateTime EndDate { get; set; }

    // Trạng thái hoạt động (true = còn dùng được, false = bị vô hiệu hoá)
    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    // Thời gian tạo coupon
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}