namespace BusinessObject.Models
{
    public class Payment
    {
        public int PaymentId { get; set; }
        public string PaymentName { get; set; }
        public string PaymentDescription { get; set; }
        public int Status { get; set; } = 1;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
    }
}