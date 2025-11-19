using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class StationCreateDTO
    {
        [Required(ErrorMessage = "Tên trạm là bắt buộc")]
        [StringLength(255, ErrorMessage = "Tên trạm không quá 255 ký tự")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Địa chỉ là bắt buộc")]
        [StringLength(500, ErrorMessage = "Địa chỉ không được quá 500 ký tự")]
        public string Address { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Mô tả không được quá 500 ký tự")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "Sức chứa trạm là bắt buộc")]
        [Range(1, 10000, ErrorMessage = "Sức chứa trạm phải từ 1 đến 10000")]
        public int StationCapacity { get; set; }

        public string OpeningHours { get; set; } = "24/7";

        [RegularExpression(@"^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8-9]|9[0-9])[0-9]{7}$",
            ErrorMessage = "Vui lòng nhập đúng định dạng SĐT Việt Nam")]
        public string? ContactNumber { get; set; }

        public IFormFile ImageUrl { get; set; }

        [Range(-90, 90, ErrorMessage = "Vĩ độ phải từ -90 đến 90")]
        public decimal? Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Kinh độ phải từ -180 đến 180")]
        public decimal? Longitude { get; set; }
    }

    public class StationDisplayDTO
    {
        public int StationID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int BikeCapacity { get; set; }
        public int StationCapacity { get; set; }
        public string OpeningHours { get; set; } = string.Empty;
        public string? ContactNumber { get; set; }
        public string? ImageUrl { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class StationUpdateDTO
    {
        [Required(ErrorMessage = "Station ID là bắt buộc")]
        public int StationID { get; set; }

        [StringLength(255, ErrorMessage = "Tên trạm không được quá 255 ký tự")]
        public string? Name { get; set; }

        [StringLength(500, ErrorMessage = "Địa chỉ không được quá 500 ký tự")]
        public string? Address { get; set; }

        [StringLength(500, ErrorMessage = "Mô tả không được quá 500 ký tự")]
        public string? Description { get; set; }

        [Range(1, 10000, ErrorMessage = "Sức chứa trạm phải từ 1 đến 10000")]
        public int? StationCapacity { get; set; }

        [StringLength(100, ErrorMessage = "Giờ mở cửa không được quá 100 ký tự")]
        public string? OpeningHours { get; set; }

        [RegularExpression(@"^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8-9]|9[0-9])[0-9]{7}$",
            ErrorMessage = "Vui lòng nhập đúng định dạng số điện thoại Việt Nam")]
        [StringLength(20, ErrorMessage = "Số điện thoại không được quá 20 ký tự")]
        public string? ContactNumber { get; set; }

        public IFormFile ImageUrl { get; set; }

        [Range(-90, 90, ErrorMessage = "Vĩ độ phải từ -90 đến 90")]
        public decimal? Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Kinh độ phải từ -180 đến 180")]
        public decimal? Longitude { get; set; }

        public bool? IsActive { get; set; }
    }
}