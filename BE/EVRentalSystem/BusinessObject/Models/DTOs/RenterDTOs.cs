using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class RenterCreateDTO
    {
        [Required(ErrorMessage = "Account ID là b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n tài kho?n h?p l?")]
        public int AccountID { get; set; }

        public int? DocumentID { get; set; }
    }

    public class RenterUpdateDTO
    {
        [Required(ErrorMessage = "Renter ID là b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n ng??i thuê h?p l?")]
        public int RenterID { get; set; }

        public int? DocumentID { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "T?ng s? l??t thuê ph?i t? 0 tr? lên")]
        public int? TotalRental { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "T?ng chi tiêu ph?i t? 0 tr? lên")]
        public decimal? TotalSpent { get; set; }
    }

    public class RenterDisplayDTO
    {
        public int RenterID { get; set; }
        public int AccountID { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string IDNumber { get; set; }
        public string LicenseNumber { get; set; }
        public string Avatar { get; set; }
        public int? DocumentID { get; set; }
        public int? DocumentStatus { get; set; }
        public int TotalRental { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime AccountCreatedAt { get; set; }
        public int AccountStatus { get; set; }
    }

    public class RenterStatisticsDTO
    {
        public int RenterID { get; set; }
        public string RenterName { get; set; }
        public int TotalRentals { get; set; }
        public int ActiveRentals { get; set; }
        public int CompletedRentals { get; set; }
        public int CancelledRentals { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal AverageRentalCost { get; set; }
        public DateTime? LastRentalDate { get; set; }
        public bool HasVerifiedDocument { get; set; }
    }
}