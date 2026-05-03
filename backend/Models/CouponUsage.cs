using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("coupon_usages")]
public class CouponUsage
{
    [Column("id")]
    public int Id { get; set; }

    [Column("coupon_id")]
    public int CouponId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("used_at")]
    public DateTime UsedAt { get; set; } = DateTime.Now;
}
