namespace BusinessObject.Models.Enum
{
    public enum AccountStatus
    {
        Inactive = 0,
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
        Reserved = 0,
        OnGoing = 1,
        Cancelled = 2,
        Completed = 3
    }

    public enum PaymentStatus
    {
        Pending = 0,
        Completed = 1,
        Failed = -1
    }
}