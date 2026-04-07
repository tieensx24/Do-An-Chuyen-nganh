using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace backend.Helpers;

public static class EncryptionHelper
{
    // Khóa bí mật (Bắt buộc phải đủ 32 ký tự cho chuẩn AES-256)
    // Thực tế nên lưu trong appsettings.json, ở đây để tạm cho dễ hiểu
    private static readonly string Key = "KienTaoSecretKey1234567890123456"; 

    public static string Encrypt(string plainText)
    {
        if (string.IsNullOrEmpty(plainText)) return plainText;
        
        using var aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(Key);
        aes.GenerateIV(); // Tạo vector ngẫu nhiên để mỗi lần mã hóa ra một chuỗi khác nhau
        var iv = aes.IV;
        
        using var encryptor = aes.CreateEncryptor(aes.Key, iv);
        using var ms = new MemoryStream();
        ms.Write(iv, 0, iv.Length); // Cất IV vào đầu chuỗi
        
        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(plainText);
        }
        return Convert.ToBase64String(ms.ToArray());
    }

    public static string Decrypt(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText)) return cipherText;
        try {
            var fullCipher = Convert.FromBase64String(cipherText);
            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(Key);
            
            var iv = new byte[16];
            Array.Copy(fullCipher, 0, iv, 0, iv.Length); // Tách IV ra từ đầu chuỗi
            aes.IV = iv;
            
            using var ms = new MemoryStream(fullCipher, iv.Length, fullCipher.Length - iv.Length);
            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            
            return sr.ReadToEnd();
        } catch { 
            return cipherText; // Nếu dữ liệu cũ chưa mã hóa thì trả về nguyên bản
        } 
    }
}