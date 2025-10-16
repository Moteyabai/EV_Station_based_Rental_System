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

        [Required(ErrorMessage = "Sức chứa xe là bắt buộc")]
        [Range(1, 20, ErrorMessage = "Sức chứa xe từ 1 đến 20")]
        public int BikeCapacity { get; set; }

        public string OpeningHours { get; set; } = "24/7";

        [RegularExpression(@"^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8-9]|9[0-9])[0-9]{7}$",
            ErrorMessage = "Vui lòng nhập đúng định dạng SĐT Việt Nam")]
        public string? ContactNumber { get; set; }

        public IFormFile ImageUrl { get; set; }

        public IFormFile ExteriorImageUrl { get; set; }

        public IFormFile ThumbnailImageUrl { get; set; }

        public bool IsActive { get; set; } = false;
    }

    public class StationUpdateDTO
    {
        [Required(ErrorMessage = "Station ID là b?t bu?c")]
        public int StationID { get; set; }

        [StringLength(255, ErrorMessage = "Tên tr?m không ???c quá 255 ký t?")]
        public string? Name { get; set; }

        [StringLength(500, ErrorMessage = "??a ch? không ???c quá 500 ký t?")]
        public string? Address { get; set; }

        [StringLength(500, ErrorMessage = "Mô t? không ???c quá 500 ký t?")]
        public string? Description { get; set; }

        [Range(1, 1000, ErrorMessage = "S?c ch?a xe ph?i t? 1 ??n 1000")]
        public int? BikeCapacity { get; set; }

        [StringLength(100, ErrorMessage = "Gi? m? c?a không ???c quá 100 ký t?")]
        public string? OpeningHours { get; set; }

        [RegularExpression(@"^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8-9]|9[0-9])[0-9]{7}$",
            ErrorMessage = "Vui lòng nh?p ?úng ??nh d?ng s? ?i?n tho?i Vi?t Nam")]
        [StringLength(20, ErrorMessage = "S? ?i?n tho?i không ???c quá 20 ký t?")]
        public string? ContactNumber { get; set; }

        [StringLength(500, ErrorMessage = "URL hình ?nh không ???c quá 500 ký t?")]
        public string? ImageUrl { get; set; }

        [StringLength(500, ErrorMessage = "URL hình ?nh bên ngoài không ???c quá 500 ký t?")]
        public string? ExteriorImageUrl { get; set; }

        [StringLength(500, ErrorMessage = "URL hình ?nh thu nh? không ???c quá 500 ký t?")]
        public string? ThumbnailImageUrl { get; set; }

        public bool? IsActive { get; set; }
    }

    public class StationStatusUpdateDTO
    {
        [Required(ErrorMessage = "Station ID là b?t bu?c")]
        public int StationID { get; set; }

        [Required(ErrorMessage = "Tr?ng thái ho?t ??ng là b?t bu?c")]
        public bool IsActive { get; set; }

        [StringLength(500, ErrorMessage = "Ghi chú không ???c quá 500 ký t?")]
        public string? Note { get; set; }
    }

    public class StationSearchDTO
    {
        [StringLength(255, ErrorMessage = "Tên tìm ki?m không ???c quá 255 ký t?")]
        public string? Name { get; set; }

        [StringLength(500, ErrorMessage = "??a ch? tìm ki?m không ???c quá 500 ký t?")]
        public string? Address { get; set; }

        public bool? IsActive { get; set; }

        [Range(1, 1000, ErrorMessage = "S?c ch?a t?i thi?u ph?i t? 1 ??n 1000")]
        public int? MinCapacity { get; set; }

        [Range(1, 1000, ErrorMessage = "S?c ch?a t?i ?a ph?i t? 1 ??n 1000")]
        public int? MaxCapacity { get; set; }

        public DateTime? CreatedAfter { get; set; }

        public DateTime? CreatedBefore { get; set; }

        [StringLength(100, ErrorMessage = "Gi? m? c?a không ???c quá 100 ký t?")]
        public string? OpeningHours { get; set; }
    }

    public class StationStatisticsDTO
    {
        public int TotalStations { get; set; }
        public int ActiveStations { get; set; }
        public int InactiveStations { get; set; }
        public int TotalBikeCapacity { get; set; }
        public int AverageCapacityPerStation { get; set; }
        public DateTime? LatestStationCreated { get; set; }
        public DateTime? LatestStationUpdated { get; set; }
        public Dictionary<string, int> StationsByOpeningHours { get; set; } = new();
        public Dictionary<int, int> StationsByCapacityRange { get; set; } = new();
    }

    public class StationSummaryDTO
    {
        public int StationID { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int BikeCapacity { get; set; }
        public string OpeningHours { get; set; } = string.Empty;
        public string? ContactNumber { get; set; }
        public bool IsActive { get; set; }
        public string StatusText { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int AvailableBikes { get; set; } // This would be calculated from actual bike data
        public int OccupiedSlots { get; set; } // This would be calculated from actual bike data
    }

    public class StationCapacityUpdateDTO
    {
        [Required(ErrorMessage = "Station ID là b?t bu?c")]
        public int StationID { get; set; }

        [Required(ErrorMessage = "S?c ch?a xe là b?t bu?c")]
        [Range(1, 1000, ErrorMessage = "S?c ch?a xe ph?i t? 1 ??n 1000")]
        public int BikeCapacity { get; set; }

        [StringLength(500, ErrorMessage = "Lý do thay ??i không ???c quá 500 ký t?")]
        public string? Reason { get; set; }
    }
}