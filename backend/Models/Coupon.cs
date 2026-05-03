using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("coupons")]
public class Coupon
{
    [Column("id")]
    public int Id { get; set; }

    [Column("code")]
    public string Code { get; set; } = "";

    [Column("type")]
    public string Type { get; set; } = "fixed";

    [Column("value")]
    public decimal Value { get; set; }

    [Column("min_order")]
    public decimal MinOrder { get; set; }

    [Column("max_discount")]
    public decimal? MaxDiscount { get; set; }

    [Column("usage_limit")]
    public int? UsageLimit { get; set; }

    [Column("used_count")]
    public int UsedCount { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime EndDate { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}
