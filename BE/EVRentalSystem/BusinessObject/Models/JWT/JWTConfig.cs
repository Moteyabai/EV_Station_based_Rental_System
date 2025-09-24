namespace BusinessObject.Models.JWT
{
    public class JWTConfig
    {
        public string Key { get; set; } = null!;
        public string Audience { get; set; } = null!;
        public string Issuer { get; set; } = null!;
    }
}