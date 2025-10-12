using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class EVBikeUpdateDTO
    {
        public int BikeID { get; set; }

        [Required(ErrorMessage = "Tên xe điện là bắt buộc")]
        [StringLength(100, ErrorMessage = "Tên xe điện không được quá 100 ký tự")]
        public string BikeName { get; set; }

        [Required(ErrorMessage = "Biển số xe là bắt buộc")]
        [StringLength(20, ErrorMessage = "Biển số xe không được quá 20 ký tự")]
        [RegularExpression(@"^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$", ErrorMessage = "Biển số xe không đúng định dạng (VD: 29A-12345)")]
        public string LicensePlate { get; set; }

        [Required(ErrorMessage = "Thương hiệu là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn thương hiệu")]
        public int BrandID { get; set; }

        [Required(ErrorMessage = "Màu sắc là bắt buộc")]
        [StringLength(30, ErrorMessage = "Màu sắc không được quá 30 ký tự")]
        public string Color { get; set; }

        [Required(ErrorMessage = "Hình ảnh mặt trước là bắt buộc")]
        public IFormFile FrontImg { get; set; }

        [Required(ErrorMessage = "Hình ảnh mặt sau là bắt buộc")]
        public IFormFile BackImg { get; set; }

        [Required(ErrorMessage = "Số lượng là bắt buộc")]
        [Range(0, 1000, ErrorMessage = "Số lượng phải từ 0 đến 1000")]
        public int Quantity { get; set; }

        [Required(ErrorMessage = "Số lần thuê là bắt buộc")]
        [Range(0, int.MaxValue, ErrorMessage = "Số lần thuê không được âm")]
        public int TimeRented { get; set; } = 0;

        [Required(ErrorMessage = "Mô tả là bắt buộc")]
        [StringLength(500, ErrorMessage = "Mô tả không được quá 500 ký tự")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Dung lượng pin là bắt buộc")]
        [StringLength(50, ErrorMessage = "Dung lượng pin không được quá 50 ký tự")]
        public string BatteryCapacity { get; set; }

        [Required(ErrorMessage = "Giá thuê theo ngày là bắt buộc")]
        [Range(0.01, 10000000, ErrorMessage = "Giá thuê phải từ 0.01 đến 10,000,000 VNĐ")]
        public decimal PricePerDay { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        [Range(0, 1, ErrorMessage = "Trạng thái chỉ có thể là 0 (Không khả dụng) hoặc 1 (Khả dụng)")]
        public int Status { get; set; } = 1; // 1: Available, 0: Unavailable
    }
}