using Net.payOS.Types;
using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class PaymentCreateDTO
    {
        [Required(ErrorMessage = "ID người dùng là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn ID người dùng hợp lý!")]
        public int AccountID { get; set; }

        [Required(ErrorMessage = "Số tiền là bắt buộc")]
        [Range(1, 999999999.99, ErrorMessage = "Số tiền phải từ 1 đến 999,999,999.99")]
        public decimal Amount { get; set; }
        [Required]
        public int BikeID { get; set; }
        [Required]
        public int StationID { get; set; }

        [Required(ErrorMessage = "Phương thức thanh toán là bắt buộc")]
        [Range(1, 3, ErrorMessage = "Phương thức thanh toán phải là 1 (PayOS), 2 (Tiền mặt)")]
        public int PaymentMethod { get; set; } // 1: PayOS, 3: Cash

        [Required(ErrorMessage = "Loại thanh toán là bắt buộc")]
        [Range(1, 3, ErrorMessage = "Loại thanh toán phải là 1 (Tiền cọc), 2 (Phí), hoặc 3 (Hoàn tiền)")]
        public int PaymentType { get; set; } // 1: Deposit, 2: Fee, 3: Refund

    }

    public class PaymentUpdateDTO
    {
        [Required(ErrorMessage = "Payment ID là b?t bu?c")]
        public int PaymentID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n ng??i thuê h?p l?")]
        public int? RenterID { get; set; }

        [Range(0.01, 999999999.99, ErrorMessage = "S? ti?n ph?i t? 0.01 ??n 999,999,999.99")]
        public decimal? Amount { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng ch?n ??n thuê h?p l?")]
        public int? RentalID { get; set; }

        [Range(1, 3, ErrorMessage = "Ph??ng th?c thanh toán ph?i là 1 (Th? tín d?ng), 2 (VNPay), ho?c 3 (Ti?n m?t)")]
        public int? PaymentMethod { get; set; }

        [Range(1, 3, ErrorMessage = "Lo?i thanh toán ph?i là 1 (Ti?n c?c), 2 (Phí), ho?c 3 (Hoàn ti?n)")]
        public int? PaymentType { get; set; }

        [Range(-1, 1, ErrorMessage = "Tr?ng thái ph?i là -1 (Th?t b?i), 0 (?ang ch?), ho?c 1 (Hoàn thành)")]
        public int? Status { get; set; }
    }

    public class PaymentStatusUpdateDTO
    {
        [Required(ErrorMessage = "Payment ID là b?t bu?c")]
        public int PaymentID { get; set; }

        [Required(ErrorMessage = "Tr?ng thái thanh toán là b?t bu?c")]
        [Range(-1, 1, ErrorMessage = "Tr?ng thái ph?i là -1 (Th?t b?i), 0 (?ang ch?), ho?c 1 (Hoàn thành)")]
        public int Status { get; set; }

        [StringLength(500, ErrorMessage = "Ghi chú không ???c quá 500 ký t?")]
        public string? Note { get; set; }
    }

    public class PaymentSearchDTO
    {
        public int? RenterID { get; set; }
        public int? RentalID { get; set; }
        public int? PaymentMethod { get; set; } // 1: Credit Card, 2: VNPay, 3: Cash
        public int? PaymentType { get; set; } // 1: Deposit, 2: Fee, 3: Refund
        public int? Status { get; set; } // -1: Failed, 0: Pending, 1: Completed
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
    }

    public class PaymentStatisticsDTO
    {
        public decimal TotalAmount { get; set; }
        public int TotalCount { get; set; }
        public int CompletedCount { get; set; }
        public int PendingCount { get; set; }
        public int FailedCount { get; set; }
        public decimal CompletedAmount { get; set; }
        public decimal PendingAmount { get; set; }
        public decimal FailedAmount { get; set; }
        public Dictionary<int, decimal> AmountByMethod { get; set; } = new();
        public Dictionary<int, decimal> AmountByType { get; set; } = new();
    }

    public class PaymentSummaryDTO
    {
        public int PaymentID { get; set; }
        public int RenterID { get; set; }
        public string RenterName { get; set; } = string.Empty;
        public int RentalID { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethodName { get; set; } = string.Empty;
        public string PaymentTypeName { get; set; } = string.Empty;
        public string StatusName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class PaymentLinkDTO
    {
        public string PaymentUrl { get; set; } = string.Empty;
    }
}