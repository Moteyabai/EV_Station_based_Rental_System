using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class RentalCreateDTO
    {
        [Required(ErrorMessage = "Bike ID l� b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n xe ?i?n h?p l?")]
        public int BikeID { get; set; }

        [Required(ErrorMessage = "Renter ID l� b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n ng??i thu� h?p l?")]
        public int RenterID { get; set; }

        [Required(ErrorMessage = "Station ID l� b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n tr?m h?p l?")]
        public int StationID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n nh�n vi�n h?p l?")]
        public int? AssignedStaff { get; set; }

        [Required(ErrorMessage = "M?c pin ban ??u l� b?t bu?c")]
        [Range(0, 100, ErrorMessage = "M?c pin ph?i t? 0 ??n 100")]
        public decimal InitialBattery { get; set; }

        [StringLength(500, ErrorMessage = "T�nh tr?ng xe ban ??u kh�ng ???c qu� 500 k� t?")]
        public string? InitBikeCondition { get; set; }

        [Required(ErrorMessage = "Ng�y thu� l� b?t bu?c")]
        public DateTime RentalDate { get; set; }

        public DateTime? ReservedDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [Required(ErrorMessage = "Ti?n ??t c?c l� b?t bu?c")]
        [Range(0, 50000000, ErrorMessage = "Ti?n ??t c?c ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal Deposit { get; set; }

        [Range(0, 50000000, ErrorMessage = "Ph� thu� ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal? Fee { get; set; }
    }

    public class RentalUpdateDTO
    {
        [Required(ErrorMessage = "Rental ID l� b?t bu?c")]
        public int RentalID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n xe ?i?n h?p l?")]
        public int? BikeID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n ng??i thu� h?p l?")]
        public int? RenterID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n tr?m h?p l?")]
        public int? StationID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n nh�n vi�n h?p l?")]
        public int? AssignedStaff { get; set; }

        [Range(0, 100, ErrorMessage = "M?c pin ban ??u ph?i t? 0 ??n 100")]
        public decimal? InitialBattery { get; set; }

        [Range(0, 100, ErrorMessage = "M?c pin cu?i ph?i t? 0 ??n 100")]
        public decimal? FinalBattery { get; set; }

        [StringLength(500, ErrorMessage = "T�nh tr?ng xe ban ??u kh�ng ???c qu� 500 k� t?")]
        public string? InitBikeCondition { get; set; }

        [StringLength(500, ErrorMessage = "T�nh tr?ng xe cu?i kh�ng ???c qu� 500 k� t?")]
        public string? FinalBikeCondition { get; set; }

        public DateTime? RentalDate { get; set; }

        public DateTime? ReservedDate { get; set; }

        public DateTime? ReturnDate { get; set; }

        [Range(0, 50000000, ErrorMessage = "Ti?n ??t c?c ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal? Deposit { get; set; }

        [Range(0, 50000000, ErrorMessage = "Ph� thu� ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal? Fee { get; set; }
    }

    public class RentalReturnDTO
    {
        [Required(ErrorMessage = "Rental ID l� b?t bu?c")]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "M?c pin cu?i l� b?t bu?c")]
        [Range(0, 100, ErrorMessage = "M?c pin cu?i ph?i t? 0 ??n 100")]
        public decimal FinalBattery { get; set; }

        [Required(ErrorMessage = "T�nh tr?ng xe cu?i l� b?t bu?c")]
        [StringLength(500, ErrorMessage = "T�nh tr?ng xe cu?i kh�ng ???c qu� 500 k� t?")]
        public string FinalBikeCondition { get; set; }

        [Required(ErrorMessage = "Ng�y tr? xe l� b?t bu?c")]
        public DateTime ReturnDate { get; set; }

        [Range(0, 50000000, ErrorMessage = "Ph� thu� ph?i t? 0 ??n 50,000,000 VN?")]
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
        [Required(ErrorMessage = "Rental ID l� b?t bu?c")]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "Staff ID l� b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n nh�n vi�n h?p l?")]
        public int StaffID { get; set; }

        [Required(ErrorMessage = "M?c pin ban ??u l� b?t bu?c")]
        [Range(0, 100, ErrorMessage = "M?c pin ph?i t? 0 ??n 100")]
        public decimal InitialBattery { get; set; }

        [StringLength(500, ErrorMessage = "T�nh tr?ng xe ban ??u kh�ng ???c qu� 500 k� t?")]
        public string? InitBikeCondition { get; set; }

        [StringLength(1000, ErrorMessage = "Ghi ch� kh�ng ???c qu� 1000 k� t?")]
        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO for staff to complete rental (OnGoing -> Completed)
    /// </summary>
    public class RentalCompleteDTO
    {
        [Required(ErrorMessage = "Rental ID l� b?t bu?c")]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "Staff ID l� b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n nh�n vi�n h?p l?")]
        public int StaffID { get; set; }

        [Required(ErrorMessage = "M?c pin cu?i l� b?t bu?c")]
        [Range(0, 100, ErrorMessage = "M?c pin cu?i ph?i t? 0 ??n 100")]
        public decimal FinalBattery { get; set; }

        [Required(ErrorMessage = "T�nh tr?ng xe cu?i l� b?t bu?c")]
        [StringLength(500, ErrorMessage = "T�nh tr?ng xe cu?i kh�ng ???c qu� 500 k� t?")]
        public string FinalBikeCondition { get; set; }

        [Range(0, 50000000, ErrorMessage = "Ph� thu� ph?i t? 0 ??n 50,000,000 VN?")]
        public decimal? Fee { get; set; }

        [StringLength(1000, ErrorMessage = "Ghi ch� kh�ng ???c qu� 1000 k� t?")]
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