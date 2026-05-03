using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Helpers;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrderController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] OrderRequestDto dto)
    {
        try
        {
            if (dto.UserId is null || dto.Items.Count == 0)
                return BadRequest(new { message = "Đơn hàng không hợp lệ." });

            var productIds = dto.Items.Select(item => item.ProductId).Distinct().ToList();
            var products = await _db.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            if (products.Count != productIds.Count)
                return BadRequest(new { message = "Một hoặc nhiều sản phẩm không còn tồn tại." });

            decimal subtotal = 0;
            var orderItems = new List<OrderItem>();

            foreach (var item in dto.Items)
            {
                if (item.Quantity <= 0)
                    return BadRequest(new { message = "Số lượng sản phẩm không hợp lệ." });

                var product = products[item.ProductId];
                subtotal += product.Price * item.Quantity;

                orderItems.Add(new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = (double)product.Price
                });
            }

            Coupon? coupon = null;
            decimal discountAmount = 0;

            if (dto.CouponId.HasValue)
            {
                coupon = await _db.Coupons.FirstOrDefaultAsync(c => c.Id == dto.CouponId.Value);
                if (coupon == null)
                    return BadRequest(new { message = "Mã giảm giá không tồn tại." });

                var validationError = CouponHelper.ValidateCoupon(coupon, subtotal, DateTime.Now);
                if (validationError != null)
                    return BadRequest(new { message = validationError });

                discountAmount = CouponHelper.CalculateDiscount(coupon, subtotal);
            }

            var finalTotal = subtotal - discountAmount;

            var order = new Order
            {
                UserId = dto.UserId,
                OrderCode = dto.OrderCode,
                CustomerName = dto.CustomerName,
                Phone = dto.Phone,
                ShippingAddress = dto.Address,
                Note = dto.Note,
                CouponId = coupon?.Id,
                DiscountAmount = discountAmount,
                TimeSlot = dto.TimeSlot,
                PaymentMethod = dto.PaymentMethod,
                TotalAmount = (double)finalTotal,
                Status = "pending",
                CreatedAt = DateTime.Now
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            foreach (var orderItem in orderItems)
            {
                orderItem.OrderId = order.Id;
                _db.OrderItems.Add(orderItem);
            }

            if (coupon != null)
            {
                coupon.UsedCount += 1;

                _db.CouponUsages.Add(new CouponUsage
                {
                    CouponId = coupon.Id,
                    UserId = dto.UserId.Value,
                    OrderId = order.Id,
                    UsedAt = DateTime.Now
                });
            }

            await _db.SaveChangesAsync();

            return Ok(new
            {
                message = "Đặt hàng thành công",
                orderId = order.Id,
                subtotal,
                discountAmount,
                finalTotal
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lưu đơn hàng: " + ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        try
        {
            var orders = await _db.Orders.ToListAsync();
            return Ok(orders);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi tải danh sách đơn hàng: " + ex.Message });
        }
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        try
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng!" });

            order.Status = newStatus;
            await _db.SaveChangesAsync();

            return Ok(new { message = "Đã cập nhật trạng thái" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái: " + ex.Message });
        }
    }
}

public class OrderRequestDto
{
    public int? UserId { get; set; }
    public string OrderCode { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";
    public string? Note { get; set; }
    public int? CouponId { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? TimeSlot { get; set; }
    public string PaymentMethod { get; set; } = "";
    public double TotalPrice { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public double Price { get; set; }
}
