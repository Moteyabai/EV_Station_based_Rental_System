using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class EVBike_StocksCreateDTO
    {
        [Required(ErrorMessage = "BikeID là bắt buộc")]
        public int BikeID { get; set; }

        public int Color { get; set; }

        [Required(ErrorMessage = "StationID là bắt buộc")]
        public int StationID { get; set; }

        [Required(ErrorMessage = "Biển số xe là bắt buộc")]
        [StringLength(20, ErrorMessage = "Biển số xe không được quá 20 ký tự")]
        [RegularExpression(@"^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$", ErrorMessage = "Biển số xe không đúng định dạng (VD: 29A-12345)")]
        public string LicensePlate { get; set; }
    }

    public class EVBike_StocksUpdateDTO
    {
        public int StockID { get; set; }
        public int? BikeID { get; set; }
        public int? Color { get; set; }
        public string? LicensePlate { get; set; }
        public int? BatteryCapacity { get; set; }
        public int? Status { get; set; }
    }

    public class EVBike_StocksDisplayDTO
    {
        public int StockID { get; set; }
        public int BikeID { get; set; }
        public int Color { get; set; }
        public int StationID { get; set; }
        public string StationName { get; set; }
        public string LicensePlate { get; set; }
        public int BatteryCapacity { get; set; }
        public int Status { get; set; }
    }
}