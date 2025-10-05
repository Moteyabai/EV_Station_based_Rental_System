using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class IDDocument
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int DocumentID { get; set; }

        [Required]
        public int AccountID { get; set; }

        public int? VerifiedByStaffID { get; set; }

        [Required]
        public string IDCardFront { get; set; }

        [Required]
        public string IDCardBack { get; set; }

        [Required]
        public string LicenseCardFront { get; set; }

        [Required]
        public string LicenseCardBack { get; set; }

        public int Status { get; set; } = 0; // 0: Pending, 1: Approved, 2: Rejected
        public string? Feedback { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        // Navigation Properties with clearer names
        [ForeignKey("AccountID")]
        public virtual Account Customer { get; set; }

        [ForeignKey("VerifiedByStaffID")]
        public virtual Account VerifiedByStaff { get; set; }
    }
}