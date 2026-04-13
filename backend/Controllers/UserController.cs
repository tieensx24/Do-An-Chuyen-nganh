using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;    // Lưu ý: Đổi chữ 'backend' thành tên project thực tế của bạn nếu cần
using backend.Models;  // Lưu ý: Đổi chữ 'backend' thành tên project thực tế của bạn nếu cần
using System.IO;
using System.Threading.Tasks;
using System;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _db;

        // Constructor nhận database context (Dependency Injection)
        public UserController(AppDbContext db)
        {
            _db = db;
        }

        // ==========================================
        // API 1: LẤY DANH SÁCH NGƯỜI DÙNG (Dùng cho trang Admin)
        // GET: api/user
        // ==========================================
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _db.Users.ToListAsync();
            return Ok(users);
        }

        // ==========================================
        // API 2: UPLOAD AVATAR CHO USER
        // POST: api/user/{id}/avatar
        // ==========================================
        [HttpPost("{id}/avatar")]
        public async Task<IActionResult> UploadAvatar(int id, IFormFile file)
        {
            // 1. Kiểm tra xem user có tồn tại không
            var user = await _db.Users.FindAsync(id);
            if (user == null) 
            {
                return NotFound("Không tìm thấy người dùng!");
            }

            // 2. Kiểm tra xem có file gửi lên không
            if (file == null || file.Length == 0) 
            {
                return BadRequest("Vui lòng chọn một file ảnh hợp lệ.");
            }

            // 3. Đường dẫn thư mục lưu ảnh
            // Tạo thư mục wwwroot/uploads/avatars nếu nó chưa tồn tại
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "avatars");
            if (!Directory.Exists(uploadsFolder)) 
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 4. Tạo tên file độc nhất (tránh bị trùng tên ảnh cũ)
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // 5. Lưu file vật lý vào ổ cứng của Server
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 6. Cập nhật đường dẫn ảnh mới vào Database
            var relativePath = $"/uploads/avatars/{fileName}";
            user.Avatar = relativePath;
            await _db.SaveChangesAsync();

            // 7. Trả về đường dẫn để React cập nhật giao diện ngay lập tức
            return Ok(new { avatarUrl = relativePath });
        }
        
        // Bạn có thể thêm các hàm PUT (sửa), DELETE (xóa) user ở bên dưới này sau này...
    }
}