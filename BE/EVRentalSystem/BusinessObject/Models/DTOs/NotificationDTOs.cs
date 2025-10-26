using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class NotificationCreateDTO
    {
        [Required(ErrorMessage = "Account ID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn tài khoản hợp lệ")]
        public int AccountID { get; set; }

        [Required(ErrorMessage = "Nội dung thông báo là bắt buộc")]
        [StringLength(1000, ErrorMessage = "Nội dung thông báo không được quá 1000 ký tự")]
        public string Message { get; set; } = string.Empty;
    }

    public class NotificationUpdateDTO
    {
        [Required(ErrorMessage = "Notification ID là bắt buộc")]
        public int NotificationID { get; set; }

        [StringLength(1000, ErrorMessage = "Nội dung thông báo không được quá 1000 ký tự")]
        public string? Message { get; set; }

        public bool? IsRead { get; set; }
    }

    public class NotificationMarkAsReadDTO
    {
        [Required(ErrorMessage = "Notification ID là bắt buộc")]
        public int NotificationID { get; set; }
    }

    public class NotificationSearchDTO
    {
        public int? AccountID { get; set; }
        public bool? IsRead { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    public class NotificationSummaryDTO
    {
        public int NotificationID { get; set; }
        public int AccountID { get; set; }
        public string AccountName { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
        public string TimeAgo { get; set; } = string.Empty;
    }

    public class NotificationStatisticsDTO
    {
        public int TotalNotifications { get; set; }
        public int UnreadNotifications { get; set; }
        public int ReadNotifications { get; set; }
        public double ReadRate { get; set; }
        public Dictionary<int, int> NotificationsByAccount { get; set; } = new();
        public DateTime? LatestNotificationDate { get; set; }
    }
}
