using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("users")]
public class User
{
    [Column("id")]
    public int Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = "";

    [Column("password_hash")]
    public string PasswordHash { get; set; } = "";

    [Column("full_name")]
    public string FullName { get; set; } = "";

    [Column("role")]
    public string Role { get; set; } = "user";  // ← sửa ở đây

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
   
      // ← thêm ?
}