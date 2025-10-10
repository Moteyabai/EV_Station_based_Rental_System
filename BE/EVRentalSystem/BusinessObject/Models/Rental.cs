using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class Rental
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RentalID { get; set; }

        public int AccountID { get; set; }
        public int BikeID { get; set; }
        public int StationID { get; set; }
    }
}