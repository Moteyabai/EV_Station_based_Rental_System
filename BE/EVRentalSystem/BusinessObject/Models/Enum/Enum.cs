namespace BusinessObject.Models.Enum
{
    public enum AccountStatus
    {
        Pending = 0,
        Active = 1,
        Suspended = 2,
        Deleted = 3
    }

    public enum DocumentStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2,
    }

    public enum RentalStatus
    {
        Pending = 0,
        Reserved = 1,
        OnGoing = 2,
        Cancelled = 3,
        Completed = 4
    }

    public enum PaymentStatus
    {
        Pending = 0,
        Completed = 1,
        Failed = -1
    }

    public enum PaymentMethod
    {
        PayOS = 1,
        Cash = 2
    }
}