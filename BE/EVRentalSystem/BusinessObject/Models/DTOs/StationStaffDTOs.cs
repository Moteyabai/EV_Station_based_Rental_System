using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class StationStaffCreateDTO
    {
        [Required(ErrorMessage = "Full Name is required.")]
        public string FullName { get; set; }

        [EmailAddress(ErrorMessage = "Vui lòng nhập đúng định dạng mail")]
        [RegularExpression(@"^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|yahoomail\.com)$",
        ErrorMessage = "Hệ thống chỉ hỗ trợ gmail và yahoomail")]
        [Required]
        public string Email { get; set; }

        [RegularExpression(@"^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$",
        ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự, 1 chữ hoa và 1 ký tự đặc biệt")]
        public string Password { get; set; }

        [RegularExpression(@"^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8-9]|9[0-9])[0-9]{7}$",
        ErrorMessage = "Vui lòng nhập đúng định dạng số điện thoại Việt Nam")]
        [Required]
        public string Phone { get; set; }

        [Required(ErrorMessage = "Avatar is required.")]
        public IFormFile AvatarPicture { get; set; }
    }

    public class StationStaffDisplayDTO
    {
        public int StaffID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string AvatarUrl { get; set; } = string.Empty;
        public int? StationID { get; set; }
        public string? StationName { get; set; }
        public int HandoverTimes { get; set; }
        public int ReceiveTimes { get; set; }
    }

    public class StationStaffUpdateDTO
    {
        [Required(ErrorMessage = "Staff ID là bắt buộc")]
        public int StaffID { get; set; }

        public int? StationID { get; set; }

        public int? HandoverTimes { get; set; }

        public int? ReceiveTimes { get; set; }
    }

    public class StationStaffAssignDTO
    {
        [Required(ErrorMessage = "Staff ID là bắt buộc")]
        public int StaffID { get; set; }

        [Required(ErrorMessage = "Station ID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn trạm hợp lệ")]
        public int StationID { get; set; }
    }

    public class StationStaffSummaryDTO
    {
        public int StaffID { get; set; }
        public int AccountID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public int? StationID { get; set; }
        public string? StationName { get; set; }
        public int HandoverTimes { get; set; }
        public int ReceiveTimes { get; set; }
        public int TotalTransactions { get; set; }
    }
}