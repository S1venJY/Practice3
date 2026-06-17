using System;
using System.IO;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using RemoteGalleryService;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddSingleton<GalleryStorageService>();

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapControllers();
app.Run();

namespace RemoteGalleryService
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
    }

    public class ImageRecord
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; }
        public int UserId { get; set; }
        public int? AlbumId { get; set; }
    }

    public class Album
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime CreationDate { get; set; }
        public int UserId { get; set; }
    }

    public class GalleryStorageService
    {
        private readonly string _storagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        private readonly string _dataPath = Path.Combine(Directory.GetCurrentDirectory(), "Data");
        private List<User> UsersDb = new();
        private List<ImageRecord> ImagesDb = new();
        private List<Album> AlbumsDb = new();

        public GalleryStorageService()
        {
            if (!Directory.Exists(_storagePath))
            {
                Directory.CreateDirectory(_storagePath);
            }

            if (!Directory.Exists(_dataPath))
            {
                Directory.CreateDirectory(_dataPath);
            }

            LoadData();
        }

        private void LoadData()
        {
            var usersFile = Path.Combine(_dataPath, "users.json");
            var imagesFile = Path.Combine(_dataPath, "images.json");
            var albumsFile = Path.Combine(_dataPath, "albums.json");

            if (File.Exists(usersFile)) UsersDb = JsonSerializer.Deserialize<List<User>>(File.ReadAllText(usersFile)) ?? new();
            if (File.Exists(imagesFile)) ImagesDb = JsonSerializer.Deserialize<List<ImageRecord>>(File.ReadAllText(imagesFile)) ?? new();
            if (File.Exists(albumsFile)) AlbumsDb = JsonSerializer.Deserialize<List<Album>>(File.ReadAllText(albumsFile)) ?? new();
        }

        private void SaveData()
        {
            var usersFile = Path.Combine(_dataPath, "users.json");
            var imagesFile = Path.Combine(_dataPath, "images.json");
            var albumsFile = Path.Combine(_dataPath, "albums.json");

            File.WriteAllText(usersFile, JsonSerializer.Serialize(UsersDb));
            File.WriteAllText(imagesFile, JsonSerializer.Serialize(ImagesDb));
            File.WriteAllText(albumsFile, JsonSerializer.Serialize(AlbumsDb));
        }

        public string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        public bool Register(string username, string email, string password)
        {
            if (UsersDb.Exists(u => u.Username == username)) return false;
            
            UsersDb.Add(new User 
            { 
                Id = UsersDb.Count + 1, 
                Username = username, 
                Email = email, 
                PasswordHash = HashPassword(password) 
            });
            SaveData();
            return true;
        }

        public User? Authenticate(string username, string password)
        {
            var hash = HashPassword(password);
            return UsersDb.Find(u => u.Username == username && u.PasswordHash == hash);
        }

        public async Task<ImageRecord?> SaveFileAsync(IFormFile file, int userId, int? albumId)
        {
            if (file == null || file.Length == 0) return null;

            var uniqueFileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var absolutePath = Path.Combine(_storagePath, uniqueFileName);
            var relativePath = $"/uploads/{uniqueFileName}";

            using (var stream = new FileStream(absolutePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var record = new ImageRecord
            {
                Id = ImagesDb.Count + 1,
                FileName = file.FileName,
                FilePath = relativePath,
                UploadDate = DateTime.UtcNow,
                UserId = userId,
                AlbumId = albumId
            };
            ImagesDb.Add(record);
            SaveData();
            return record;
        }

        public Album CreateAlbum(string title, int userId)
        {
            var album = new Album { Id = AlbumsDb.Count + 1, Title = title, CreationDate = DateTime.UtcNow, UserId = userId };
            AlbumsDb.Add(album);
            SaveData();
            return album;
        }

        public List<ImageRecord> GetUserImages(int userId, int? albumId) => 
            ImagesDb.FindAll(img => img.UserId == userId && (albumId == null || img.AlbumId == albumId));

        public List<Album> GetUserAlbums(int userId) => 
            AlbumsDb.FindAll(al => al.UserId == userId);
    }

    [Route("api/[controller]")]
    [ApiController]
    public class GalleryController : ControllerBase
    {
        private readonly GalleryStorageService _storage;

        public GalleryController(GalleryStorageService storage)
        {
            _storage = storage;
        }

        [HttpPost("auth/register")]
        public IActionResult RegisterUser([FromForm] string username, [FromForm] string email, [FromForm] string password)
        {
            return _storage.Register(username, email, password) 
                ? Ok("Успішна реєстрація") 
                : BadRequest("Користувач вже існує");
        }

        [HttpPost("auth/login")]
        public IActionResult LoginUser([FromForm] string username, [FromForm] string password)
        {
            var user = _storage.Authenticate(username, password);
            return user != null 
                ? Ok(new { user.Id, user.Username }) 
                : Unauthorized("Невірні облікові дані");
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage(IFormFile file, [FromForm] int userId, [FromForm] int? albumId)
        {
            var record = await _storage.SaveFileAsync(file, userId, albumId);
            return record != null 
                ? Ok(record) 
                : BadRequest("Помилка завантаження файлу");
        }

        [HttpPost("albums/create")]
        public IActionResult CreateNewAlbum([FromForm] string title, [FromForm] int userId)
        {
            var album = _storage.CreateAlbum(title, userId);
            return Ok(album);
        }

        [HttpGet("view/grid")]
        public IActionResult GetGalleryGrid([FromQuery] int userId, [FromQuery] int? albumId)
        {
            var images = _storage.GetUserImages(userId, albumId);
            var albums = _storage.GetUserAlbums(userId);
            return Ok(new { Images = images, Albums = albums });
        }
    }
}