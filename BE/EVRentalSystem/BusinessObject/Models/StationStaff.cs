using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class StationStaff
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StaffID { get; set; }

        public int? StationID { get; set; }
        public int AccountID { get; set; }
        public int HandoverTimes { get; set; } = 0;
        public int ReceiveTimes { get; set; } = 0;

        public virtual Account Account { get; set; }
        public virtual Station Station { get; set; }
    }
}