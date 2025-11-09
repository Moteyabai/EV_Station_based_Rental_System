using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class Renter
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RenterID { get; set; }

        [Required]
        public int AccountID { get; set; }

        public int? DocumentID { get; set; }

        [Required]
        public int TotalRental { get; set; } = 0;

        [Required]
        public decimal TotalSpent { get; set; } = 0;

        public bool IsVerified { get; set; } = false;

        public virtual Account Account { get; set; }

        [ForeignKey("DocumentID")]
        public virtual IDDocument IDDocument { get; set; }
    }
}