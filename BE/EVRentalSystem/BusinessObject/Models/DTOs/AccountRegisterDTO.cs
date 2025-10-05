using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class AccountRegisterDTO
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

        [Required(ErrorMessage = "IDCardFront  is required.")]
        public IFormFile IDCardFront { get; set; }

        [Required(ErrorMessage = "IDCardBack is required.")]
        public IFormFile IDCardBack { get; set; }

        [Required(ErrorMessage = "LicenseCardFront  is required.")]
        public IFormFile LicenseCardFront { get; set; }

        [Required(ErrorMessage = "LicenseCardBack is required.")]
        public IFormFile LicenseCardBack { get; set; }
    }
}