using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.JWT;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace API.Controllers
{
    [Route("api/[controller]")]
    public class EVBike_StocksController : ControllerBase
    {
        private readonly EVBike_StocksService _evBikeStocksService;
        private readonly EVBikeService _evBikeService;
        private readonly StationService _stationService;

        public EVBike_StocksController(EVBike_StocksService evBikeStocksService, EVBikeService evBikeService, StationService stationService)
        {
            _evBikeStocksService = evBikeStocksService;
            _evBikeService = evBikeService;
            _stationService = stationService;
        }

        [HttpGet("GetAllEVBikeStocks")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<EVBike_Stocks>>> GetAllEVBikeStocks()
        {
            // Check user permission (Admin only)
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
                var stocks = await _evBikeStocksService.GetAllAsync();
                if (stocks == null || !stocks.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Hiện không có xe nào"
                    };
                    return NotFound(res);
                }
                return Ok(stocks);
            }
            catch (Exception ex)
            {
                var res = new ResponseDTO
                {
                    Message = $"Lỗi khi lấy dữ liệu: {ex.Message}"
                };
                return StatusCode(StatusCodes.Status500InternalServerError, res);
            }
        }

        [HttpGet("GetStocksByBikeID/{bikeID}")]
        public async Task<IActionResult> GetStocksByBikeID(int bikeID)
        {
            var res = new ResponseDTO();
            try
            {
                var stocks = await _evBikeStocksService.GetStocksByBikeIDAsync(bikeID);
                if (stocks == null || !stocks.Any())
                {
                    res.Message = $"Hiện không có xe cho BikeID: {bikeID}";
                    return NotFound(res);
                }
                return Ok(stocks);
            }
            catch (Exception ex)
            {
                res.Message = $"Lỗi khi lấy dữ liệu: {ex.Message}";
                return StatusCode(StatusCodes.Status500InternalServerError, res);
            }
        }

        [HttpGet("GetStockByLicensePlate/{licensePlate}")]
        [Authorize]
        public async Task<IActionResult> GetStockByLicensePlate(string licensePlate)
        {
            var res = new ResponseDTO();
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "2" && permission != "3")
            {
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                var stock = await _evBikeStocksService.GetStockByLicensePlateAsync(licensePlate);
                if (stock == null)
                {
                    res.Message = $"Không tìm thấy xe với biển số: {licensePlate}";
                    return NotFound(res);
                }
                return Ok(stock);
            }
            catch (Exception ex)
            {
                res.Message = $"Lỗi khi lấy dữ liệu: {ex.Message}";
                return StatusCode(StatusCodes.Status500InternalServerError, res);
            }
        }

        [HttpPost("AddEVBikeStock")]
        [Authorize]
        public async Task<IActionResult> AddEVBikeStock([FromBody] EVBike_StocksCreateDTO newStock)
        {
            var res = new ResponseDTO();
            // Check user permission (Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                // Validate BikeID
                var bike = await _evBikeService.GetByIdAsync(newStock.BikeID);
                if (bike == null)
                {
                    res.Message = $"BikeID {newStock.BikeID} không tồn tại.";
                    return BadRequest(res);
                }
                // Validate StationID
                var station = await _stationService.GetByIdAsync(newStock.StationID);
                if (station == null)
                {
                    res.Message = $"StationID {newStock.StationID} không tồn tại.";
                    return BadRequest(res);
                }
                // Check for duplicate LicensePlate
                var existingStock = await _evBikeStocksService.GetStockByLicensePlateAsync(newStock.LicensePlate);
                if (existingStock != null)
                {
                    res.Message = $"Biển số {newStock.LicensePlate} đã tồn tại.";
                    return Conflict(res);
                }
                // Add new stock
                var stockToAdd = new EVBike_Stocks
                {
                    BikeID = newStock.BikeID,
                    Color = newStock.Color,
                    StationID = newStock.StationID,
                    LicensePlate = newStock.LicensePlate,
                };
                await _evBikeStocksService.AddAsync(stockToAdd);

                // Update bike quantity
                bike.Quantity += 1;
                await _evBikeService.UpdateAsync(bike);

                res.Message = "Thêm xe thành công.";
                return Ok(res);
            }
            catch (Exception ex)
            {
                res.Message = $"Lỗi khi thêm xe: {ex.Message}";
                return StatusCode(StatusCodes.Status500InternalServerError, res);
            }
        }
    }
}