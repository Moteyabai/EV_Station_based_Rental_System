using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class RentalCreateDTO
    {
        [Required(ErrorMessage = "Bike ID là b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n xe ?i?n h?p l?")]
        public int BikeID { get; set; }

        [Required(ErrorMessage = "Renter ID là b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n ng??i thuê h?p l?")]
        public int RenterID { get; set; }

        [Required(ErrorMessage = "Station ID là b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n tr?m h?p l?")]
        public int StationID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n nhân viên h?p l?")]
        public int? AssignedStaff { get; set; }

        [Required(ErrorMessage = "M?c pin ban ??u là b?t bu?c")]
        [Range(0, 100, ErrorMessage = "M?c pin ph?i t? 0 ??n 100")]
        public decimal InitialBattery { get; set; }

        [StringLength(500, ErrorMessage = "Tình tr?ng xe ban ??u không ???c quá 500 ký t?")]
        public string? InitBikeCondition { get; set; }

        [Required(ErrorMessage = "Ngày thuê là b?t bu?c")]
        public DateTime RentalDate { get; set; }

        public DateTime? ReservedDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [Required(ErrorMessage = "Ti?n ??t c?c là b?t bu?c")]
        [Range(0, 50000000, ErrorMessage = "Ti?n ??t c?c ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal Deposit { get; set; }

        [Range(0, 50000000, ErrorMessage = "Phí thuê ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal? Fee { get; set; }
    }

    public class RentalDisplayDTO
    {
        public int RentalID { get; set; }
        public string BikeName { get; set; }
        public string LicensePlate { get; set; }
        public string RenterName { get; set; }
        public string PhoneNumber { get; set; }
        public string Email { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public DateTime? HandoverDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public int? AssignedStaff { get; set; }
        public decimal InitialBattery { get; set; }
        public decimal? FinalBattery { get; set; }
        public string? InitBikeCondition { get; set; }
        public string? FinalBikeCondition { get; set; }
        public decimal Deposit { get; set; }
        public decimal? Fee { get; set; }
        public int Status { get; set; } // "Reserved", "OnGoing", "Cancelled", "Completed"
    }

    public class RentalUpdateDTO
    {
        [Required(ErrorMessage = "Rental ID là b?t bu?c")]
        public int RentalID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n xe ?i?n h?p l?")]
        public int? BikeID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n ng??i thuê h?p l?")]
        public int? RenterID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n tr?m h?p l?")]
        public int? StationID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n nhân viên h?p l?")]
        public int? AssignedStaff { get; set; }

        [Range(0, 100, ErrorMessage = "M?c pin ban ??u ph?i t? 0 ??n 100")]
        public decimal? InitialBattery { get; set; }

        [Range(0, 100, ErrorMessage = "M?c pin cu?i ph?i t? 0 ??n 100")]
        public decimal? FinalBattery { get; set; }

        [StringLength(500, ErrorMessage = "Tình tr?ng xe ban ??u không ???c quá 500 ký t?")]
        public string? InitBikeCondition { get; set; }

        [StringLength(500, ErrorMessage = "Tình tr?ng xe cu?i không ???c quá 500 ký t?")]
        public string? FinalBikeCondition { get; set; }

        public DateTime? RentalDate { get; set; }

        public DateTime? ReservedDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [Range(0, 50000000, ErrorMessage = "Ti?n ??t c?c ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal? Deposit { get; set; }

        [Range(0, 50000000, ErrorMessage = "Phí thuê ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal? Fee { get; set; }
    }

    public class RentalReturnDTO
    {
        [Required(ErrorMessage = "Rental ID là bắt buộc")]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "Mức pin cuối là bắt buộc")]
        [Range(0, 100, ErrorMessage = "Mức pin cuối phải từ 0 đến 100")]
        public int FinalBattery { get; set; }

        [Required(ErrorMessage = "Tình trạng xe là bắt buộc")]
        [StringLength(500, ErrorMessage = "Tình trạng xe không được quá 500 ký tự!")]
        public string FinalBikeCondition { get; set; }

        public string Note { get; set; }

        [Required(ErrorMessage = "Ngày trả xe là bắt buộc")]
        public DateTime ReturnDate { get; set; }

        [Range(0, 50000000, ErrorMessage = "Phí thuê phải từ 0 đến 50,000,000 VN")]
        public decimal? Fee { get; set; }
    }

    public class RentalSearchDTO
    {
        public int? RenterID { get; set; }
        public int? BikeID { get; set; }
        public int? StationID { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Status { get; set; } // "active", "pending", "completed"
    }

    /// <summary>
    /// DTO for staff to confirm rental start (Reserved -> OnGoing)
    /// </summary>
    public class RentalConfirmStartDTO
    {
        [Required(ErrorMessage = "Rental ID là bắt buộc")]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "Staff ID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn nhân viên hợp lệ")]
        public int StaffID { get; set; }

        [Required(ErrorMessage = "M?c pin ban ??u là b?t bu?c")]
        [Range(0, 100, ErrorMessage = "M?c pin ph?i t? 0 ??n 100")]
        public decimal InitialBattery { get; set; }

        [StringLength(500, ErrorMessage = "Tình tr?ng xe ban ??u không ???c quá 500 ký t?")]
        public string? InitBikeCondition { get; set; }

        [StringLength(1000, ErrorMessage = "Ghi chú không ???c quá 1000 ký t?")]
        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO for staff to complete rental (OnGoing -> Completed)
    /// </summary>
    public class RentalCompleteDTO
    {
        [Required(ErrorMessage = "Rental ID là b?t bu?c")]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "Staff ID là b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n nhân viên h?p l?")]
        public int StaffID { get; set; }

        [Required(ErrorMessage = "M?c pin cu?i là b?t bu?c")]
        [Range(0, 100, ErrorMessage = "M?c pin cu?i ph?i t? 0 ??n 100")]
        public decimal FinalBattery { get; set; }

        [Required(ErrorMessage = "Tình tr?ng xe cu?i là b?t bu?c")]
        [StringLength(500, ErrorMessage = "Tình tr?ng xe cu?i không ???c quá 500 ký t?")]
        public string FinalBikeCondition { get; set; }

        [Range(0, 50000000, ErrorMessage = "Phí thuê ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal? Fee { get; set; }

        [StringLength(1000, ErrorMessage = "Ghi chú không ???c quá 1000 ký t?")]
        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO for getting rentals assigned to a specific staff
    /// </summary>
    public class StaffRentalFilterDTO
    {
        public int? StaffID { get; set; }
        public int? Status { get; set; } // 0: Reserved, 1: OnGoing, 2: Cancelled, 3: Completed
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}