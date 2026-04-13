using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Required for ToListAsync and FindAsync
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly AppDbContext _db;
    public OrderController(AppDbContext db) { _db = db; }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] OrderRequestDto dto)
    {
        try
        {
            // 1. Create main order (orders table)
            var order = new Order
            {
                UserId = dto.UserId,
                OrderCode = dto.OrderCode,
                CustomerName = dto.CustomerName,
                Phone = dto.Phone,
                ShippingAddress = dto.Address,
                Note = dto.Note,
                TimeSlot = dto.TimeSlot,
                PaymentMethod = dto.PaymentMethod,
                TotalAmount = dto.TotalPrice,
                Status = "pending",
                CreatedAt = DateTime.Now
            };

            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            // 2. Create order details (orders_item table)
            foreach (var item in dto.Items)
            {
                var orderItem = new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = item.Price
                };
                _db.OrderItems.Add(orderItem);
            }

            await _db.SaveChangesAsync();

            return Ok(new { message = "Đặt hàng thành công", orderId = order.Id });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi khi lưu đơn hàng: " + ex.Message });
        }
    }

    // --- ADDED: API to GET all orders for the Admin Dashboard ---
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

    // --- ADDED: API to UPDATE order status ---
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        try
        {
            var order = await _db.Orders.FindAsync(id);
            if (order == null)
            {
                return NotFound(new { message = "Không tìm thấy đơn hàng!" });
            }

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