namespace BusinessObject.Models.DTOs
{
    public class EVBikeDisplayDTO
    {
        public int BikeID { get; set; }

        public string BikeName { get; set; }
        public int BrandID { get; set; }
        public string BrandName { get; set; }

        public string? FrontImg { get; set; }

        public string? BackImg { get; set; }

        public int MaxSpeed { get; set; } = 0;

        public int MaxDistance { get; set; } = 0;

        public int TimeRented { get; set; } = 0;

        public int Quantity { get; set; } = 0;
        public string? Description { get; set; }
        public decimal PricePerDay { get; set; }
    }
}