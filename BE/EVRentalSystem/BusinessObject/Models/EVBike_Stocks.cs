using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class EVBike_Stocks
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int StockID { get; set; }

        [Required(ErrorMessage = "BikeID là bắt buộc")]
        public int BikeID { get; set; }

        [Required(ErrorMessage = "Màu sắc là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn màu sắc")]
        public int Color { get; set; }

        [Required(ErrorMessage = "StationID là bắt buộc")]
        public int StationID { get; set; }

        [Required(ErrorMessage = "Biển số là bắt buộc")]
        [MaxLength(20)]
        public string LicensePlate { get; set; } = null!;

        [Required(ErrorMessage = "Dung lượng pin là bắt buộc")]
        [Range(0, 100, ErrorMessage = "Dung lượng pin phải từ 0 đến 100")]
        public int BatteryCapacity { get; set; } = 100;

        public int Status { get; set; } = 1; //1: Available, 0: Unavailable , 2: In Maintenance
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        [ForeignKey("BikeID")]
        public virtual EVBike EVBike { get; set; } = null!;

        [ForeignKey("StationID")]
        public virtual Station Station { get; set; } = null!;
    }
}