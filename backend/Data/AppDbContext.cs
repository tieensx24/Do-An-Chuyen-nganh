using Microsoft.EntityFrameworkCore;
using backend.Models;
// using backend.Helpers; // Tạm thời khóa dòng này lại nếu file Helpers không còn dùng ở đây nữa

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Category> Categories { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ĐÃ TẮT MÃ HÓA: Cấu hình bảng User để lưu tên dưới dạng chữ bình thường
        // modelBuilder.Entity<User>()
        //     .Property(u => u.FullName)
        //     .HasConversion(
        //         textCanLuu => EncryptionHelper.Encrypt(textCanLuu),
        //         textTuDbVe => EncryptionHelper.Decrypt(textTuDbVe)
        //     );
    }
}