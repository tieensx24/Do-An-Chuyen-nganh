using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Helpers; // 1. THÊM DÒNG NÀY ĐỂ GỌI ENCRYPTION HELPER

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Product> Products { get; set; }

    // 2. THÊM NGUYÊN HÀM NÀY VÀO ĐỂ CẤU HÌNH MÃ HÓA
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Báo cho EF Core tự động Mã hóa (lúc lưu) và Giải mã (lúc lấy) cho cột FullName
        modelBuilder.Entity<User>()
            .Property(u => u.FullName)
            .HasConversion(
                textCanLuu => EncryptionHelper.Encrypt(textCanLuu),
                textTuDbVe => EncryptionHelper.Decrypt(textTuDbVe)
            );
    }
}