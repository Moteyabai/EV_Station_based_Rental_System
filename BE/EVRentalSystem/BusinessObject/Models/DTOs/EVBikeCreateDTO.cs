using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class EVBikeCreateDTO
    {
        [Required(ErrorMessage = "Tên xe điện là bắt buộc")]
        [StringLength(100, ErrorMessage = "Tên xe điện không được quá 100 ký tự")]
        public string BikeName { get; set; }

        [Required(ErrorMessage = "Thương hiệu là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn thương hiệu")]
        public int BrandID { get; set; }

        [Required(ErrorMessage = "Hình ảnh mặt trước là bắt buộc")]
        public IFormFile FrontImg { get; set; }

        [Required(ErrorMessage = "Hình ảnh mặt sau là bắt buộc")]
        public IFormFile BackImg { get; set; }

        [Required(ErrorMessage = "Tốc độ tối đa là bắt buộc")]
        [Range(0, int.MaxValue, ErrorMessage = "Tốc độ tối đa không được âm")]
        public int MaxSpeed { get; set; }

        [Required(ErrorMessage = "Quãng đường tối đa là bắt buộc")]
        [Range(0, int.MaxValue, ErrorMessage = "Quãng đường tối đa không được âm")]
        public int MaxDistance { get; set; }

        [Required(ErrorMessage = "Dung lượng pin là bắt buộc")]
        [Range(0, 999.9, ErrorMessage = "Dung lượng pin phải từ 0 đến 999.9 kWh")]
        public decimal BatteryCapacity { get; set; }

        [Required(ErrorMessage = "Mô tả là bắt buộc")]
        [StringLength(500, ErrorMessage = "Mô tả không được quá 500 ký tự")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Giá thuê theo ngày là bắt buộc")]
        [Range(0.01, 10000000, ErrorMessage = "Giá thuê phải từ 0.01 đến 10,000,000 VNĐ")]
        public decimal PricePerDay { get; set; }
    }
}