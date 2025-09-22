using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class Account
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AccountId { get; set; }

        public string FullName { get; set; }

        [EmailAddress(ErrorMessage = "Vui lòng nhập đúng định dạng mail")]
        public string Email { get; set; }

        [RegularExpression(@"^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$",
        ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự, 1 chữ hoa và 1 ký tự đặc biệt")]
        public string Password { get; set; }

        public int Status { get; set; } = 1; // 1: Active, 0: Inactive
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}