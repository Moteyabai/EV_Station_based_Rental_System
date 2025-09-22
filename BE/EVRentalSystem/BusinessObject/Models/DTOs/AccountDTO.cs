using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObject.Models.DTOs
{
    public class AccountDTO
    {
        public int AccountID { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? Token { get; set; }
        public int RoleID { get; set; }
    }
}
