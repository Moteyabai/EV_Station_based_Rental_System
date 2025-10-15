using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
