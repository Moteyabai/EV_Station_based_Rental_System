namespace BusinessObject.Models
{
    public class Feedback
    {
        public int FeedbackID { get; set; }
        public int RenterID { get; set; }
        public string Content { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;
        public virtual Renter Renter { get; set; }
    }
}