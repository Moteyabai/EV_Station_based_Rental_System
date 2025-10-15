using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class PaymentCreateDTO
    {
        [Required(ErrorMessage = "M� ng??i thu� l� b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n ng??i thu� h?p l?")]
        public int RenterID { get; set; }

        [Required(ErrorMessage = "S? ti?n l� b?t bu?c")]
        [Range(0.01, 999999999.99, ErrorMessage = "S? ti?n ph?i t? 0.01 ??n 999,999,999.99")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "M� thu� l� b?t bu?c")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n ??n thu� h?p l?")]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "Ph??ng th?c thanh to�n l� b?t bu?c")]
        [Range(1, 3, ErrorMessage = "Ph??ng th?c thanh to�n ph?i l� 1 (Th? t�n d?ng), 2 (VNPay), ho?c 3 (Ti?n m?t)")]
        public int PaymentMethod { get; set; } // 1: Credit Card, 2: VNPay, 3: Cash

        [Required(ErrorMessage = "Lo?i thanh to�n l� b?t bu?c")]
        [Range(1, 3, ErrorMessage = "Lo?i thanh to�n ph?i l� 1 (Ti?n c?c), 2 (Ph�), ho?c 3 (Ho�n ti?n)")]
        public int PaymentType { get; set; } // 1: Deposit, 2: Fee, 3: Refund

        [Range(-1, 1, ErrorMessage = "Tr?ng th�i ph?i l� -1 (Th?t b?i), 0 (?ang ch?), ho?c 1 (Ho�n th�nh)")]
        public int Status { get; set; } = 0; // 1: Completed, 0: Pending, -1: Failed
    }

    public class PaymentUpdateDTO
    {
        [Required(ErrorMessage = "Payment ID l� b?t bu?c")]
        public int PaymentID { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n ng??i thu� h?p l?")]
        public int? RenterID { get; set; }

        [Range(0.01, 999999999.99, ErrorMessage = "S? ti?n ph?i t? 0.01 ??n 999,999,999.99")]
        public decimal? Amount { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "Vui l�ng ch?n ??n thu� h?p l?")]
        public int? RentalID { get; set; }

        [Range(1, 3, ErrorMessage = "Ph??ng th?c thanh to�n ph?i l� 1 (Th? t�n d?ng), 2 (VNPay), ho?c 3 (Ti?n m?t)")]
        public int? PaymentMethod { get; set; }

        [Range(1, 3, ErrorMessage = "Lo?i thanh to�n ph?i l� 1 (Ti?n c?c), 2 (Ph�), ho?c 3 (Ho�n ti?n)")]
        public int? PaymentType { get; set; }

        [Range(-1, 1, ErrorMessage = "Tr?ng th�i ph?i l� -1 (Th?t b?i), 0 (?ang ch?), ho?c 1 (Ho�n th�nh)")]
        public int? Status { get; set; }
    }

    public class PaymentStatusUpdateDTO
    {
        [Required(ErrorMessage = "Payment ID l� b?t bu?c")]
        public int PaymentID { get; set; }

        [Required(ErrorMessage = "Tr?ng th�i thanh to�n l� b?t bu?c")]
        [Range(-1, 1, ErrorMessage = "Tr?ng th�i ph?i l� -1 (Th?t b?i), 0 (?ang ch?), ho?c 1 (Ho�n th�nh)")]
        public int Status { get; set; }

        [StringLength(500, ErrorMessage = "Ghi ch� kh�ng ???c qu� 500 k� t?")]
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
}