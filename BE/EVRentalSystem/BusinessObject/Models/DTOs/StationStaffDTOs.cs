using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class StationStaffCreateDTO
    {
        [Required(ErrorMessage = "Account ID là b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n tài kho?n h?p l?")]
        public int AccountID { get; set; }

        public int? StationID { get; set; }
    }

    public class StationStaffUpdateDTO
    {
        [Required(ErrorMessage = "Staff ID là b?t bu?c")]
        public int StaffID { get; set; }

        public int? StationID { get; set; }

        public int? HandoverTimes { get; set; }

        public int? ReceiveTimes { get; set; }
    }

    public class StationStaffAssignDTO
    {
        [Required(ErrorMessage = "Staff ID là b?t bu?c")]
        public int StaffID { get; set; }

        [Required(ErrorMessage = "Station ID là b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n tr?m h?p l?")]
        public int StationID { get; set; }
    }

    public class StationStaffSearchDTO
    {
        public int? StationID { get; set; }

        public int? AccountID { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "S? l?n bàn giao t?i thi?u ph?i >= 0")]
        public int? MinHandoverTimes { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "S? l?n thu h?i t?i thi?u ph?i >= 0")]
        public int? MinReceiveTimes { get; set; }
    }

    public class StationStaffStatisticsDTO
    {
        public int TotalStaff { get; set; }
        public int StaffWithStation { get; set; }
        public int StaffWithoutStation { get; set; }
        public int TotalHandoverTimes { get; set; }
        public int TotalReceiveTimes { get; set; }
        public double AverageHandoverPerStaff { get; set; }
        public double AverageReceivePerStaff { get; set; }
        public Dictionary<int, int> StaffCountByStation { get; set; } = new();
    }

    public class StationStaffSummaryDTO
    {
        public int StaffID { get; set; }
        public int AccountID { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public int? StationID { get; set; }
        public string? StationName { get; set; }
        public int HandoverTimes { get; set; }
        public int ReceiveTimes { get; set; }
        public int TotalTransactions { get; set; }
    }
}