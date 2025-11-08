using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class Refund
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RefundID { get; set; }

        [Required]
        [ForeignKey("Payment")]
        public long PaymentID { get; set; }

        [Required]
        public decimal RefundAmount { get; set; }

        [Required]
        public string RefundReason { get; set; }

        [Required]
        public DateTime RefundDate { get; set; }

        [Required]
        [ForeignKey("StationStaff")]
        public int ByStaff { get; set; }

        public int Status { get; set; }

        public virtual Payment Payment { get; set; }
        public virtual StationStaff StationStaff { get; set; }
    }
}