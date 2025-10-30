namespace BusinessObject.Models.DTOs
{
    public class IDDocumentDisplayDTO
    {
        public int DocumentID { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string? FullName { get; set; }
        public string? DateOfBirth { get; set; }
        public string? IDNumber { get; set; }
        public string? LicenseNumber { get; set; }
        public string IDCardFront { get; set; }
        public string IDCardBack { get; set; }
        public string LicenseCardFront { get; set; }
        public string LicenseCardBack { get; set; }
        public int Status { get; set; }
    }
}