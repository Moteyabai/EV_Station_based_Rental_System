using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.JWT;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BrandController : ControllerBase
    {
        private readonly BrandService _brandService;
        private readonly EVBikeService _evBikeService;

        public BrandController(BrandService brandService, EVBikeService evBikeService)
        {
            _brandService = brandService;
            _evBikeService = evBikeService;
        }

        /// <summary>
        /// Get all brands (Public access)
        /// </summary>
        [HttpGet("GetAllBrands")]
        public async Task<ActionResult<IEnumerable<Brand>>> GetAllBrands()
        {
            try
            {
                var brands = await _brandService.GetAllAsync();
                if (brands == null || !brands.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh sách thương hiệu trống"
                    };
                    return NotFound(res);
                }
                return Ok(brands);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all brands with bike count (Public access)
        /// </summary>
        [HttpGet("GetBrandsWithBikeCount")]
        public async Task<ActionResult<IEnumerable<BrandDisplayDTO>>> GetBrandsWithBikeCount()
        {
            try
            {
                var brands = await _brandService.GetAllAsync();
                if (brands == null || !brands.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh sách thương hiệu trống"
                    };
                    return NotFound(res);
                }

                var bikes = await _evBikeService.GetAllAsync();
                var brandDisplayList = brands.Select(brand => new BrandDisplayDTO
                {
                    BrandID = brand.BrandID,
                    BrandName = brand.BrandName,
                    TotalBikes = bikes.Count(b => b.BrandID == brand.BrandID)
                }).ToList();

                return Ok(brandDisplayList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get brand by ID (Public access)
        /// </summary>
        [HttpGet("GetBrandById/{id}")]
        public async Task<ActionResult<Brand>> GetBrandById(int id)
        {
            try
            {
                var brand = await _brandService.GetByIdAsync(id);
                if (brand == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thương hiệu!"
                    };
                    return NotFound(res);
                }
                return Ok(brand);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Create new brand (Admin only)
        /// </summary>
        [HttpPost("CreateBrand")]
        [Authorize]
        public async Task<ActionResult> CreateBrand([FromBody] BrandCreateDTO brandDto)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập!"
                };
                return Unauthorized(res);
            }

            if (!ModelState.IsValid)
            {
                var res = new ResponseDTO
                {
                    Message = "Dữ liệu không hợp lệ!"
                };
                return BadRequest(res);
            }

            try
            {
                // Check if brand name already exists
                var existingBrands = await _brandService.GetAllAsync();
                if (existingBrands.Any(b => b.BrandName.Equals(brandDto.BrandName, StringComparison.OrdinalIgnoreCase)))
                {
                    var res = new ResponseDTO
                    {
                        Message = "Tên thương hiệu đã tồn tại!"
                    };
                    return BadRequest(res);
                }

                var brand = new Brand
                {
                    BrandName = brandDto.BrandName
                };

                await _brandService.AddAsync(brand);

                var successRes = new ResponseDTO
                {
                    Message = "Thêm thương hiệu thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Update brand (Admin only)
        /// </summary>
        [HttpPut("UpdateBrand")]
        [Authorize]
        public async Task<ActionResult> UpdateBrand([FromBody] BrandUpdateDTO brandDto)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập!"
                };
                return Unauthorized(res);
            }

            if (!ModelState.IsValid)
            {
                var res = new ResponseDTO
                {
                    Message = "Dữ liệu không hợp lệ!"
                };
                return BadRequest(res);
            }

            try
            {
                var existingBrand = await _brandService.GetByIdAsync(brandDto.BrandID);
                if (existingBrand == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thương hiệu!"
                    };
                    return NotFound(res);
                }

                // Check if new brand name already exists (excluding current brand)
                var allBrands = await _brandService.GetAllAsync();
                if (allBrands.Any(b => b.BrandID != brandDto.BrandID &&
                                      b.BrandName.Equals(brandDto.BrandName, StringComparison.OrdinalIgnoreCase)))
                {
                    var res = new ResponseDTO
                    {
                        Message = "Tên thương hiệu đã tồn tại!"
                    };
                    return BadRequest(res);
                }

                existingBrand.BrandName = brandDto.BrandName;

                await _brandService.UpdateAsync(existingBrand);

                var successRes = new ResponseDTO
                {
                    Message = "Cập nhật thương hiệu thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete brand (Admin only)
        /// </summary>
        [HttpDelete("DeleteBrand/{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteBrand(int id)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập!"
                };
                return Unauthorized(res);
            }

            try
            {
                var brand = await _brandService.GetByIdAsync(id);
                if (brand == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thương hiệu!"
                    };
                    return NotFound(res);
                }

                // Check if brand is being used by any bikes
                var bikes = await _evBikeService.GetAllAsync();
                if (bikes.Any(b => b.BrandID == id))
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không thể xóa thương hiệu đang được sử dụng bởi xe điện!"
                    };
                    return BadRequest(res);
                }

                await _brandService.DeleteAsync(id);

                var successRes = new ResponseDTO
                {
                    Message = "Xóa thương hiệu thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Search brands by name (Public access)
        /// </summary>
        [HttpGet("SearchBrands")]
        public async Task<ActionResult<IEnumerable<Brand>>> SearchBrands([FromQuery] string searchTerm)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return await GetAllBrands();
                }

                var brands = await _brandService.GetAllAsync();
                var filteredBrands = brands.Where(b =>
                    b.BrandName.Contains(searchTerm, StringComparison.OrdinalIgnoreCase)
                ).ToList();

                if (!filteredBrands.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thương hiệu phù hợp!"
                    };
                    return NotFound(res);
                }

                return Ok(filteredBrands);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}