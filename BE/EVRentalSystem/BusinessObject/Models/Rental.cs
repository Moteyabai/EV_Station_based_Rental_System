using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class Rental
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "Bike ID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn xe điện hợp lệ")]
        [ForeignKey("EVBike")]
        public int BikeID { get; set; }

        [Required(ErrorMessage = "Biển số xe là bắt buộc")]
        public string LicensePlate { get; set; } = string.Empty;

        [Required(ErrorMessage = "Renter ID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn tài khoản hợp lệ")]
        [ForeignKey("Renter")]
        public int RenterID { get; set; }

        [Required(ErrorMessage = "Station ID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn trạm hợp lệ")]
        [ForeignKey("Station")]
        public int StationID { get; set; }

        public string? Note { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn nhân viên hợp lệ")]
        [ForeignKey("Staff")]
        public int? AssignedStaff { get; set; }

        [Required(ErrorMessage = "Mức pin ban đầu là bắt buộc")]
        [Range(0, 100, ErrorMessage = "Mức pin phải từ 0 đến 100")]
        public decimal InitialBattery { get; set; }

        [Range(0, 100, ErrorMessage = "Mức pin cuối phải từ 0 đến 100")]
        public decimal? FinalBattery { get; set; }

        public string? InitBikeCondition { get; set; }

        public string? FinalBikeCondition { get; set; }

        [Required(ErrorMessage = "Ngày thuê là bắt buộc")]
        public DateTime? RentalDate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [DateGreaterThan("RentalDate", ErrorMessage = "Ngày trả phải sau ngày thuê")]
        public DateTime? ReturnDate { get; set; }

        [Required(ErrorMessage = "Tiền đặt cọc là bắt buộc")]
        [Range(0, 50000000, ErrorMessage = "Tiền đặt cọc phải từ 0 đến 50,000,000 VNĐ")]
        public decimal Deposit { get; set; }

        [Range(0, 50000000, ErrorMessage = "Phí thuê phải từ 0 đến 50,000,000 VNĐ")]
        public decimal? Fee { get; set; }

        public int Status { get; set; } = 0; // 0: Reserved, 1: On-going, 2: Cancelled, 3: Completed

        // Navigation properties
        public EVBike EVBike { get; set; }

        public Renter Renter { get; set; }
        public StationStaff Staff { get; set; }
        public Station Station { get; set; }
    }

    public class DateGreaterThanAttribute : ValidationAttribute
    {
        private readonly string _comparisonProperty;

        public DateGreaterThanAttribute(string comparisonProperty)
        {
            _comparisonProperty = comparisonProperty;
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null) return ValidationResult.Success;

            var currentValue = (DateTime)value;
            var property = validationContext.ObjectType.GetProperty(_comparisonProperty);

            if (property == null)
                throw new ArgumentException("Property with this name not found");

            var comparisonValue = (DateTime)property.GetValue(validationContext.ObjectInstance);

            if (currentValue <= comparisonValue)
                return new ValidationResult(ErrorMessage);

            return ValidationResult.Success;
        }
    }
}