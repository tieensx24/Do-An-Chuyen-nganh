using backend.Models;

namespace backend.Helpers;

public static class CouponHelper
{
    public static decimal CalculateDiscount(Coupon coupon, decimal subtotal)
    {
        if (subtotal <= 0)
            return 0;

        decimal discount = coupon.Type == "percent"
            ? subtotal * (coupon.Value / 100m)
            : coupon.Value;

        if (coupon.MaxDiscount.HasValue)
            discount = Math.Min(discount, coupon.MaxDiscount.Value);

        discount = Math.Min(discount, subtotal);

        return Math.Round(discount, 2, MidpointRounding.AwayFromZero);
    }

    public static string? ValidateCoupon(Coupon coupon, decimal subtotal, DateTime now)
    {
        if (!coupon.IsActive)
            return "Mã giảm giá hiện đang bị tắt.";

        if (now < coupon.StartDate)
            return "Mã giảm giá chưa đến thời gian sử dụng.";

        if (now > coupon.EndDate)
            return "Mã giảm giá đã hết hạn.";

        if (subtotal < coupon.MinOrder)
            return $"Đơn hàng cần tối thiểu {coupon.MinOrder:N0} ₫ để dùng mã này.";

        if (coupon.UsageLimit.HasValue && coupon.UsedCount >= coupon.UsageLimit.Value)
            return "Mã giảm giá đã hết lượt sử dụng.";

        return null;
    }
}
