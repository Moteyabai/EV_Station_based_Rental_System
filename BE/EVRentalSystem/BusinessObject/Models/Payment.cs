using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObject.Models
{
    public class Payment
    {
        [Key]
        public long PaymentID { get; set; }

        [Required(ErrorMessage = "Mã người thuê là bắt buộc")]
        [ForeignKey("Renter")]
        public int RenterID { get; set; }

        [Required(ErrorMessage = "Số tiền là bắt buộc")]
        [Column(TypeName = "decimal(18,2)")]
        [Range(0.01, 999999999.99, ErrorMessage = "Số tiền phải từ 0.01 đến 999,999,999.99")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Mã thuê là bắt buộc")]
        public int RentalID { get; set; }

        [Required(ErrorMessage = "Phương thức thanh toán là bắt buộc")]
        [Range(1, 3, ErrorMessage = "Phương thức thanh toán phải là 1 (Thẻ tín dụng), 2 (VNPay), hoặc 3 (Tiền mặt)")]
        public int PaymentMethod { get; set; } // 1: Credit Card, 2: VNPay, 3: Cash

        [Required(ErrorMessage = "Loại thanh toán là bắt buộc")]
        [Range(1, 3, ErrorMessage = "Loại thanh toán phải là 1 (Tiền cọc), 2 (Phí), hoặc 3 (Hoàn tiền)")]
        public int PaymentType { get; set; } // 1: Deposit, 2: Fee, 3: Refund

        [Range(-1, 1, ErrorMessage = "Trạng thái phải là -1 (Thất bại), 0 (Đang chờ), hoặc 1 (Hoàn thành)")]
        public int Status { get; set; } = 0; // 1: Completed, 0: Pending, -1: Failed

        [Required(ErrorMessage = "Ngày tạo là bắt buộc")]
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "Ngày cập nhật là bắt buộc")]
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public virtual Renter Renter { get; set; }
        [ForeignKey("RentalID")]
        public virtual Rental Rental { get; set; }
    }
}