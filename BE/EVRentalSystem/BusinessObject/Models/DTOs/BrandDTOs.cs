using System.ComponentModel.DataAnnotations;

namespace BusinessObject.Models.DTOs
{
    public class BrandCreateDTO
    {
        [Required(ErrorMessage = "Tên thương hiệu là bắt buộc")]
        [StringLength(100, ErrorMessage = "Tên thương hiệu không được quá 100 ký tự")]
        public string BrandName { get; set; } = string.Empty;
    }

    public class BrandUpdateDTO
    {
        [Required(ErrorMessage = "Brand ID là bắt buộc")]
        [Range(1, int.MaxValue, ErrorMessage = "Brand ID phải lớn hơn 0")]
        public int BrandID { get; set; }

        [Required(ErrorMessage = "Tên thương hiệu là bắt buộc")]
        [StringLength(100, ErrorMessage = "Tên thương hiệu không được quá 100 ký tự")]
        public string BrandName { get; set; } = string.Empty;
    }

    public class BrandDisplayDTO
    {
        public int BrandID { get; set; }
        public string BrandName { get; set; } = string.Empty;
        public int TotalBikes { get; set; } // Number of bikes using this brand
    }
}