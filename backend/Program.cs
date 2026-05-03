using Microsoft.EntityFrameworkCore;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Kết nối MySQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySQL(builder.Configuration.GetConnectionString("DefaultConnection")!));

// 2. CORS vẫn phải giữ để React gọi được API
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

// 3. Middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("AllowAll"); 
app.UseStaticFiles(); 

// XÓA UseAuthentication
app.UseAuthorization();

app.MapControllers();
app.Run();