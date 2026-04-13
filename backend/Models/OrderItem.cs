using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("orders_item")] // Đúng với tên bảng trong SQL của bạn
public class OrderItem
{
    [Column("id")]
    public int Id { get; set; }

    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("product_id")]
    public int ProductId { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; }

    [Column("price")]
    public double Price { get; set; }
}