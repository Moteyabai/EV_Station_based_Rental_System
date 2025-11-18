using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class Station
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StationID { get; set; }

        [Required]
        [StringLength(255)]
        public string Name { get; set; }

        [Required]
        [StringLength(500)]
        public string Address { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        [StringLength(100)]
        public string OpeningHours { get; set; } = "24/7";

        [RegularExpression(@"^(\+84|84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8-9]|9[0-9])[0-9]{7}$",
            ErrorMessage = "Vui lòng nhập đúng định dạng số điện thoại Việt Nam")]
        [StringLength(20)]
        public string ContactNumber { get; set; }

        [StringLength(500)]
        public string ImageUrl { get; set; }

        [Range(-90, 90, ErrorMessage = "Vĩ độ phải từ -90 đến 90")]
        public decimal? Latitude { get; set; }

        [Range(-180, 180, ErrorMessage = "Kinh độ phải từ -180 đến 180")]
        public decimal? Longitude { get; set; }

        // New: overall station capacity (total slots/space)
        [Required]
        [Range(1, 10000, ErrorMessage = "Station capacity must be between 1 and 10000")]
        public int StationCapacity { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public virtual ICollection<StationStaff> StationStaffs { get; set; }
    }
}