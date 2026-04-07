using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Kết nối MySQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(builder.Configuration.GetConnectionString("DefaultConnection")!));

// 2. Cấu hình CORS (Mở "AllowAll" để cả React và Swagger đều gọi API thoải mái)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ==========================================
// 3. KHU VỰC MIDDLEWARE (THỨ TỰ CỰC KỲ QUAN TRỌNG)
// ==========================================

// Bật Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Bật CORS (Phải nằm trước StaticFiles và Authorization)
app.UseCors("AllowAll"); 

// Bật đọc file tĩnh (Để load ảnh từ wwwroot)
app.UseStaticFiles(); 

app.UseAuthorization();

app.MapControllers();

// Lệnh Run CHỈ ĐƯỢC GỌI 1 LẦN DUY NHẤT ở cuối cùng
app.Run();