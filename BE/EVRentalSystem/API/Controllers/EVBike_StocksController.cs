using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.Enum;
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
        private readonly StationStaffService _stationStaffService;

        public EVBike_StocksController(EVBike_StocksService evBikeStocksService
            , EVBikeService evBikeService, StationService stationService, StationStaffService stationStaffService)
        {
            _evBikeStocksService = evBikeStocksService;
            _evBikeService = evBikeService;
            _stationService = stationService;
            _stationStaffService = stationStaffService;
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
        [Authorize]
        public async Task<ActionResult<IEnumerable<EVBike_StocksDisplayDTO>>> GetStocksByBikeID(int bikeID)
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
                var stocks = await _evBikeStocksService.GetStocksByBikeIDAsync(bikeID);
                if (stocks == null || !stocks.Any())
                {
                    res.Message = "Không tìm thấy xe nào.";
                    return NotFound(res);
                }

                var display = new List<EVBike_StocksDisplayDTO>();
                foreach (var stock in stocks)
                {
                    var dis = new EVBike_StocksDisplayDTO
                    {
                        StockID = stock.StockID,
                        BikeID = stock.BikeID,
                        Color = stock.Color,
                        StationID = stock.StationID,
                        StationName = stock.Station.Name,
                        BatteryCapacity = stock.BatteryCapacity,
                        LicensePlate = stock.LicensePlate,
                        Status = stock.Status
                    };
                    display.Add(dis);
                }

                return Ok(display);
            }
            catch (Exception ex)
            {
                res.Message = $"Lỗi khi lấy dữ liệu: {ex.Message}";
                return Array.Empty<EVBike_StocksDisplayDTO>();
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

        [HttpPut("UpdateEVBikeStock/{stockID}")]
        [Authorize]
        public async Task<IActionResult> UpdateEVBikeStock(int stockID, [FromBody] EVBike_StocksUpdateDTO updatedStock)
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
                var existingStock = await _evBikeStocksService.GetByIdAsync(stockID);
                if (existingStock == null)
                {
                    res.Message = $"Không tìm thấy xe với StockID: {stockID}";
                    return NotFound(res);
                }

                if (existingStock.Status == (int)BikeStatus.Unavailable)
                {
                    res.Message = "Xe đang được thuê không thể sửa!";
                    return BadRequest(res);
                }
                // Update stock details
                existingStock.LicensePlate = updatedStock.LicensePlate ?? existingStock.LicensePlate;
                existingStock.BatteryCapacity = updatedStock.BatteryCapacity ?? existingStock.BatteryCapacity;
                existingStock.Color = updatedStock.Color.Value;
                existingStock.Status = updatedStock.Status.Value;
                await _evBikeStocksService.UpdateAsync(existingStock);
                res.Message = "Cập nhật xe thành công.";
                return Ok(res);
            }
            catch (Exception ex)
            {
                res.Message = $"Lỗi khi cập nhật xe: {ex.Message}";
                return StatusCode(StatusCodes.Status500InternalServerError, res);
            }
        }

        [HttpDelete("DeleteEVBikeStock/{stockID}")]
        [Authorize]
        public async Task<IActionResult> DeleteEVBikeStock(int stockID)
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
                var existingStock = await _evBikeStocksService.GetByIdAsync(stockID);
                if (existingStock == null)
                {
                    res.Message = $"Không tìm thấy xe với StockID: {stockID}";
                    return NotFound(res);
                }
                if (existingStock.Status == (int)BikeStatus.Unavailable)
                {
                    res.Message = "Xe đang được thuê không thể xóa!";
                    return BadRequest(res);
                }
                await _evBikeStocksService.DeleteAsync(stockID);
                res.Message = "Xóa xe thành công.";
                return Ok(res);
            }
            catch (Exception ex)
            {
                res.Message = $"Lỗi khi xóa xe: {ex.Message}";
                return StatusCode(StatusCodes.Status500InternalServerError, res);
            }
        }

        [HttpGet("GetStocksAtStationByAccountID/{accountID}")]
        [Authorize]
        public async Task<IActionResult> GetStocksAtStationByAccountID(int accountID)
        {
            var res = new ResponseDTO();
            // Check user permission (Staff only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "2")
            {
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                var staff = await _stationStaffService.GetStaffByAccountID(accountID);
                if (staff == null)
                {
                    res.Message = "Nhân viên không tồn tại.";
                    return NotFound(res);
                }

                if (staff.StationID == null)
                {
                    res.Message = "Nhân viên chưa được phân công trạm.";
                    return BadRequest(res);
                }

                var station = await _stationService.GetByIdAsync(staff.StationID.Value);
                if (station == null)
                {
                    res.Message = "Trạm không tồn tại.";
                    return NotFound(res);
                }
                var stocks = await _evBikeStocksService.GetAllStocksAtStationAsync(staff.StationID.Value);
                if (stocks == null || !stocks.Any())
                {
                    res.Message = "Không tìm thấy xe nào.";
                    return NotFound(res);
                }
                var display = new List<EVBike_StocksDisplayDTO>();
                foreach (var stock in stocks)
                {
                    var dis = new EVBike_StocksDisplayDTO
                    {
                        StockID = stock.StockID,
                        BikeID = stock.BikeID,
                        Color = stock.Color,
                        StationID = stock.StationID,
                        StationName = stock.Station.Name,
                        BatteryCapacity = stock.BatteryCapacity,
                        LicensePlate = stock.LicensePlate,
                        Status = stock.Status
                    };
                    display.Add(dis);
                }
                return Ok(display);
            }
            catch (Exception ex)
            {
                res.Message = $"Lỗi khi lấy danh sách xe: {ex.Message}";
                return StatusCode(StatusCodes.Status500InternalServerError, res);
            }
        }
    }
}