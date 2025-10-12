using Microsoft.AspNetCore.Http;

namespace BusinessObject.Models.DTOs
{
    public class AccountUpdateDTO
    {
        public int AccountID { get; set; }
        public string FullName { get; set; }
        public string PhoneNumber { get; set; }
        public IFormFile Avatar { get; set; }
    }
}