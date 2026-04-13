using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("categories")]
public class Category
{
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    public string Name { get; set; } = "";

    [Column("description")]
    public string? Description { get; set; }
    
    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}