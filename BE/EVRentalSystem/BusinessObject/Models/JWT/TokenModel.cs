namespace BusinessObject.Models.JWT
{
    public class TokenModel
    {
        public int AccountID { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int RoleID { get; set; }
        public string RoleName { get; set; }
    }
}