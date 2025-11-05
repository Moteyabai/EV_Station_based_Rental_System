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

        [StringLength(500)]
        public string ExteriorImageUrl { get; set; }

        [StringLength(500)]
        public string ThumbnailImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public virtual ICollection<StationStaff> StationStaffs { get; set; }
    }
}