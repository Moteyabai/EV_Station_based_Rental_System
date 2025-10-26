using Microsoft.AspNetCore.Http;

namespace BusinessObject.Models.DTOs
{
    public class IDocumentUpdateDTO
    {
        public int DocumentID { get; set; }
        public IFormFile IDCardFront { get; set; }
        public IFormFile IDCardBack { get; set; }
        public IFormFile LicenseCardFront { get; set; }
        public IFormFile LicenseCardBack { get; set; }
    }
}