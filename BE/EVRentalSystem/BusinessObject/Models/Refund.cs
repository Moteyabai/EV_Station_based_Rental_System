using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
