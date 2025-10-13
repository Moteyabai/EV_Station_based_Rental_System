using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class Renter
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RenterID { get; set; }

        public int AccountID { get; set; }
        public int? DocumentID { get; set; }

        [Required]
        public int TotalRental { get; set; } = 0;

        [Required]
        public decimal TotalSpent { get; set; } = 0;

        public virtual Account Account { get; set; }
        public virtual IDDocument IDDocument { get; set; }
    }
}