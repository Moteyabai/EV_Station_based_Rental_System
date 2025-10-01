using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class EVBike
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BikeID { get; set; }

        [Required]
        public string BikeName { get; set; }

        [Required]
        public string BikeType { get; set; }

        [Required]
        public string LicensePlate { get; set; }

        [Required]
        public int BrandID { get; set; }

        [Required]
        public string Color { get; set; }

        [Required]
        public int YearOfManufacture { get; set; }

        [Required]
        public string ImageUrl { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string BatteryCapacity { get; set; }

        [Required]
        public decimal PricePerDay { get; set; }

        [Required]
        public int Status { get; set; } = 1; // 1: Available, 0: Unavailable

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public virtual Brand Brand { get; set; }
    }
}