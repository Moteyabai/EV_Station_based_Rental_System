using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class VerifyIDDTO
    {
        [Required(ErrorMessage = "Document ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Document ID must be greater than 0")]
        public int DocumentID { get; set; }

        public int Status { get; set; }

        [StringLength(500, ErrorMessage = "Note cannot exceed 500 characters")]
        public string Note { get; set; }

        [Required(ErrorMessage = "Verified By Staff ID is required")]
        [Range(1, int.MaxValue, ErrorMessage = "Verified By Staff ID must be greater than 0")]
        public int VerifiedByStaffID { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string? Name { get; set; }

        [Required(ErrorMessage = "License Number is required")]
        [StringLength(50, ErrorMessage = "License Number cannot exceed 50 characters")]
        public string LicenseNumber { get; set; }

        [Required(ErrorMessage = "ID Number is required")]
        [StringLength(50, ErrorMessage = "ID Number cannot exceed 50 characters")]
        public string IDNumber { get; set; }
    }
}