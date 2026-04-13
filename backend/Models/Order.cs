using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("orders")]
public class Order
{
    [Column("id")]
    public int Id { get; set; }

    // THÊM DẤU ?: Cho phép giá trị NULL từ database cũ
    [Column("order_code")]
    public string? OrderCode { get; set; } 

    [Column("user_id")]
    public int? UserId { get; set; } 

    // THÊM DẤU ?: Cho phép giá trị NULL từ database cũ
    [Column("customer_name")]
    public string? CustomerName { get; set; } 

    // THÊM DẤU ?: Cho phép giá trị NULL từ database cũ
    [Column("phone")]
    public string? Phone { get; set; } 

    [Column("total_amount")]
    public double TotalAmount { get; set; }

    [Column("status")]
    public string Status { get; set; } = "pending";

    // THÊM DẤU ?: Cho phép giá trị NULL từ database cũ
    [Column("shipping_address")]
    public string? ShippingAddress { get; set; } 

    [Column("note")]
    public string? Note { get; set; }

    [Column("time_slot")]
    public string? TimeSlot { get; set; }

    // THÊM DẤU ?: Cho phép giá trị NULL từ database cũ
    [Column("payment_method")]
    public string? PaymentMethod { get; set; } 

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}