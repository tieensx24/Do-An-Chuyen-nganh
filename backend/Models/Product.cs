using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("products")]
public class Product
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = "";

    [Column("description")]
    public string? Description { get; set; }   // ← thêm ?

    [Column("price")]
    public decimal Price { get; set; }

    [Column("stock_quantity")]
    public int StockQuantity { get; set; }

    [Column("category_id")]
    public int? CategoryId { get; set; }

    [Column("brand")]
    public string? Brand { get; set; }          // ← thêm ?

    [Column("unit")]
    public string? Unit { get; set; }           // ← thêm ?

    [Column("image")]
    public string? Image { get; set; }          // ← thêm ?

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}