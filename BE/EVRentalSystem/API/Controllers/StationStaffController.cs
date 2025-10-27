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
    [ApiController]
    public class StationStaffController : ControllerBase
    {
        private readonly StationStaffService _stationStaffService;
        private readonly AccountService _accountService;
        private readonly StationService _stationService;
        private readonly RentalService _rentalService;

        public StationStaffController(
            StationStaffService stationStaffService,
            AccountService accountService,
            StationService stationService,
            RentalService rentalService)
        {
            _stationStaffService = stationStaffService;
            _accountService = accountService;
            _stationService = stationService;
            _rentalService = rentalService;
        }

        /// <summary>
        /// Get all station staff (Admin only)
        /// </summary>
        [HttpGet("GetAllStaff")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<StationStaff>>> GetAllStaff()
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
                var staff = await _stationStaffService.GetAllAsync();
                if (staff == null || !staff.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh sách nhân viên trống"
                    };
                    return NotFound(res);
                }
                return Ok(staff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get staff by ID
        /// </summary>
        [HttpGet("GetStaffById/{id}")]
        [Authorize]
        public async Task<ActionResult<StationStaff>> GetStaffById(int id)
        {
            // Check user permission (Admin or Staff themselves)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                var staff = await _stationStaffService.GetByIdAsync(id);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                // Allow: Admin or staff viewing their own info
                if (permission != "3" && staff.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có quyền truy cập!"
                    };
                    return Unauthorized(res);
                }

                return Ok(staff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Create new station staff (Admin only)
        /// </summary>
        [HttpPost("CreateStaff")]
        [Authorize]
        public async Task<ActionResult> CreateStaff([FromBody] StationStaffCreateDTO staffDto)
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
                // Check if account exists and is a staff account
                var account = await _accountService.GetByIdAsync(staffDto.AccountID);
                if (account == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Tài khoản không tồn tại!"
                    };
                    return NotFound(res);
                }

                if (account.RoleID != 2) // RoleID 2 = Staff
                {
                    var res = new ResponseDTO
                    {
                        Message = "Tài khoản không phải là nhân viên!"
                    };
                    return BadRequest(res);
                }

                // Check if station exists (if provided)
                if (staffDto.StationID.HasValue)
                {
                    var station = await _stationService.GetByIdAsync(staffDto.StationID.Value);
                    if (station == null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Trạm không tồn tại!"
                        };
                        return NotFound(res);
                    }
                }

                var staff = new StationStaff
                {
                    AccountID = staffDto.AccountID,
                    StationID = staffDto.StationID,
                    HandoverTimes = 0,
                    ReceiveTimes = 0
                };

                await _stationStaffService.AddAsync(staff);

                var successRes = new ResponseDTO
                {
                    Message = "Thêm nhân viên thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Update staff information (Admin only)
        /// </summary>
        [HttpPut("UpdateStaff")]
        [Authorize]
        public async Task<ActionResult> UpdateStaff([FromBody] StationStaffUpdateDTO staffDto)
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
                var existingStaff = await _stationStaffService.GetByIdAsync(staffDto.StaffID);
                if (existingStaff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                // Check if new station exists (if provided)
                if (staffDto.StationID.HasValue)
                {
                    var station = await _stationService.GetByIdAsync(staffDto.StationID.Value);
                    if (station == null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Trạm không tồn tại!"
                        };
                        return NotFound(res);
                    }
                }

                // Update only provided fields
                if (staffDto.StationID.HasValue)
                    existingStaff.StationID = staffDto.StationID;
                if (staffDto.HandoverTimes.HasValue)
                    existingStaff.HandoverTimes = staffDto.HandoverTimes.Value;
                if (staffDto.ReceiveTimes.HasValue)
                    existingStaff.ReceiveTimes = staffDto.ReceiveTimes.Value;

                await _stationStaffService.UpdateAsync(existingStaff);

                var successRes = new ResponseDTO
                {
                    Message = "Cập nhật thông tin nhân viên thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Assign staff to a station (Admin only)
        /// </summary>
        [HttpPut("AssignToStation")]
        [Authorize]
        public async Task<ActionResult> AssignToStation([FromBody] StationStaffAssignDTO assignDto)
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
                var staff = await _stationStaffService.GetByIdAsync(assignDto.StaffID);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                var station = await _stationService.GetByIdAsync(assignDto.StationID);
                if (station == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin trạm!"
                    };
                    return NotFound(res);
                }

                staff.StationID = assignDto.StationID;
                await _stationStaffService.UpdateAsync(staff);

                var successRes = new ResponseDTO
                {
                    Message = $"Đã phân công nhân viên đến trạm {station.Name}!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Remove staff from station (Admin only)
        /// </summary>
        [HttpPut("RemoveFromStation/{staffId}")]
        [Authorize]
        public async Task<ActionResult> RemoveFromStation(int staffId)
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
                var staff = await _stationStaffService.GetByIdAsync(staffId);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                staff.StationID = null;
                await _stationStaffService.UpdateAsync(staff);

                var successRes = new ResponseDTO
                {
                    Message = "Đã gỡ nhân viên khỏi trạm!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete staff (Admin only)
        /// </summary>
        [HttpDelete("DeleteStaff/{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteStaff(int id)
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
                var staff = await _stationStaffService.GetByIdAsync(id);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                await _stationStaffService.DeleteAsync(id);

                var successRes = new ResponseDTO
                {
                    Message = "Xóa nhân viên thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Increment handover count (Staff or Admin)
        /// </summary>
        [HttpPut("IncrementHandover/{staffId}")]
        [Authorize]
        public async Task<ActionResult> IncrementHandover(int staffId)
        {
            // Check user permission (Staff themselves or Admin)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                var staff = await _stationStaffService.GetByIdAsync(staffId);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                // Allow: Admin or staff themselves
                if (permission != "3" && staff.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có quyền truy cập!"
                    };
                    return Unauthorized(res);
                }

                staff.HandoverTimes++;
                await _stationStaffService.UpdateAsync(staff);

                var successRes = new ResponseDTO
                {
                    Message = "Đã cập nhật số lần bàn giao xe!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Increment receive count (Staff or Admin)
        /// </summary>
        [HttpPut("IncrementReceive/{staffId}")]
        [Authorize]
        public async Task<ActionResult> IncrementReceive(int staffId)
        {
            // Check user permission (Staff themselves or Admin)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                var staff = await _stationStaffService.GetByIdAsync(staffId);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                // Allow: Admin or staff themselves
                if (permission != "3" && staff.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có quyền truy cập!"
                    };
                    return Unauthorized(res);
                }

                staff.ReceiveTimes++;
                await _stationStaffService.UpdateAsync(staff);

                var successRes = new ResponseDTO
                {
                    Message = "Đã cập nhật số lần thu hồi xe!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Search staff with filters (Admin only)
        /// </summary>
        [HttpPost("SearchStaff")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<StationStaff>>> SearchStaff([FromBody] StationStaffSearchDTO searchDto)
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
                var staffList = await _stationStaffService.GetAllAsync();

                // Apply filters
                if (searchDto.StationID.HasValue)
                {
                    staffList = staffList.Where(s => s.StationID == searchDto.StationID.Value);
                }

                if (searchDto.AccountID.HasValue)
                {
                    staffList = staffList.Where(s => s.AccountID == searchDto.AccountID.Value);
                }

                if (searchDto.MinHandoverTimes.HasValue)
                {
                    staffList = staffList.Where(s => s.HandoverTimes >= searchDto.MinHandoverTimes.Value);
                }

                if (searchDto.MinReceiveTimes.HasValue)
                {
                    staffList = staffList.Where(s => s.ReceiveTimes >= searchDto.MinReceiveTimes.Value);
                }

                return Ok(staffList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get staff statistics (Admin only)
        /// </summary>
        [HttpGet("GetStaffStatistics")]
        [Authorize]
        public async Task<ActionResult<StationStaffStatisticsDTO>> GetStaffStatistics()
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
                var staffList = (await _stationStaffService.GetAllAsync()).ToList();

                var statistics = new StationStaffStatisticsDTO
                {
                    TotalStaff = staffList.Count,
                    StaffWithStation = staffList.Count(s => s.StationID.HasValue),
                    StaffWithoutStation = staffList.Count(s => !s.StationID.HasValue),
                    TotalHandoverTimes = staffList.Sum(s => s.HandoverTimes),
                    TotalReceiveTimes = staffList.Sum(s => s.ReceiveTimes),
                    AverageHandoverPerStaff = staffList.Count > 0 ? staffList.Average(s => s.HandoverTimes) : 0,
                    AverageReceivePerStaff = staffList.Count > 0 ? staffList.Average(s => s.ReceiveTimes) : 0
                };

                // Staff count by station
                statistics.StaffCountByStation = staffList
                    .Where(s => s.StationID.HasValue)
                    .GroupBy(s => s.StationID.Value)
                    .ToDictionary(g => g.Key, g => g.Count());

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #region Rental Status Management

        /// <summary>
        /// Get rentals assigned to a staff member (Staff or Admin)
        /// </summary>
        [HttpGet("GetAssignedRentals/{staffId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetAssignedRentals(int staffId, [FromQuery] int? status = null)
        {
            // Check user permission (Staff themselves or Admin)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                var staff = await _stationStaffService.GetByIdAsync(staffId);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                // Allow: Admin or staff viewing their own rentals
                if (permission != "3" && staff.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có quyền truy cập!"
                    };
                    return Unauthorized(res);
                }

                var allRentals = await _rentalService.GetAllAsync();
                var assignedRentals = allRentals.Where(r => r.AssignedStaff == staffId);

                // Filter by status if provided
                if (status.HasValue)
                {
                    assignedRentals = assignedRentals.Where(r => r.Status == status.Value);
                }

                return Ok(assignedRentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Confirm rental start - Change status from Reserved to OnGoing (Staff or Admin)
        /// </summary>
        [HttpPut("ConfirmRentalStart")]
        [Authorize]
        public async Task<ActionResult> ConfirmRentalStart([FromBody] RentalConfirmStartDTO confirmDto)
        {
            // Check user permission (Staff or Admin)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            if (permission != "3" && permission != "2")
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
                // Get rental
                var rental = await _rentalService.GetByIdAsync(confirmDto.RentalID);
                if (rental == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thuê xe!"
                    };
                    return NotFound(res);
                }

                // Verify staff exists
                var staff = await _stationStaffService.GetByIdAsync(confirmDto.StaffID);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                // Check if staff is authorized (Admin or the staff themselves)
                if (permission != "3" && staff.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Bạn chỉ có thể xác nhận giao xe cho chính mình!"
                    };
                    return Unauthorized(res);
                }

                // Check current status
                if (rental.Status != (int)RentalStatus.Reserved)
                {
                    var res = new ResponseDTO
                    {
                        Message = $"Chỉ có thể xác nhận giao xe khi trạng thái là 'Reserved'. Trạng thái hiện tại: {((RentalStatus)rental.Status).ToString()}"
                    };
                    return BadRequest(res);
                }

                // Update rental
                rental.Status = (int)RentalStatus.OnGoing;
                rental.AssignedStaff = confirmDto.StaffID;
                rental.InitialBattery = confirmDto.InitialBattery;
                rental.InitBikeCondition = confirmDto.InitBikeCondition;
                rental.RentalDate = DateTime.Now; // Set actual rental start time

                await _rentalService.UpdateAsync(rental);

                // Increment staff handover count
                staff.HandoverTimes++;
                await _stationStaffService.UpdateAsync(staff);

                var successRes = new ResponseDTO
                {
                    Message = "Đã xác nhận giao xe thành công! Trạng thái đơn thuê chuyển sang 'Đang thuê'."
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Complete rental - Change status from OnGoing to Completed (Staff or Admin)
        /// </summary>
        [HttpPut("CompleteRental")]
        [Authorize]
        public async Task<ActionResult> CompleteRental([FromBody] RentalCompleteDTO completeDto)
        {
            // Check user permission (Staff or Admin)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            if (permission != "3" && permission != "2")
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
                // Get rental
                var rental = await _rentalService.GetByIdAsync(completeDto.RentalID);
                if (rental == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thuê xe!"
                    };
                    return NotFound(res);
                }

                // Verify staff exists
                var staff = await _stationStaffService.GetByIdAsync(completeDto.StaffID);
                if (staff == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin nhân viên!"
                    };
                    return NotFound(res);
                }

                // Check if staff is authorized (Admin or the staff themselves)
                if (permission != "3" && staff.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Bạn chỉ có thể xác nhận thu hồi xe cho chính mình!"
                    };
                    return Unauthorized(res);
                }

                // Check current status
                if (rental.Status != (int)RentalStatus.OnGoing)
                {
                    var res = new ResponseDTO
                    {
                        Message = $"Chỉ có thể hoàn thành đơn thuê khi trạng thái là 'OnGoing'. Trạng thái hiện tại: {((RentalStatus)rental.Status).ToString()}"
                    };
                    return BadRequest(res);
                }

                // Check if rental is already returned
                if (rental.ReturnDate.HasValue)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Đơn thuê này đã được trả xe!"
                    };
                    return BadRequest(res);
                }

                // Update rental
                rental.Status = (int)RentalStatus.Completed;
                rental.FinalBattery = completeDto.FinalBattery;
                rental.FinalBikeCondition = completeDto.FinalBikeCondition;
                rental.ReturnDate = DateTime.Now; // Set actual return time

                if (completeDto.Fee.HasValue)
                {
                    rental.Fee = completeDto.Fee;
                }

                await _rentalService.UpdateAsync(rental);

                // Increment staff receive count
                staff.ReceiveTimes++;
                await _stationStaffService.UpdateAsync(staff);

                var successRes = new ResponseDTO
                {
                    Message = "Đã xác nhận thu hồi xe thành công! Trạng thái đơn thuê chuyển sang 'Hoàn thành'."
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all rentals at a specific station (Staff or Admin)
        /// </summary>
        [HttpGet("GetStationRentals/{stationId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetStationRentals(int stationId, [FromQuery] int? status = null)
        {
            // Check user permission (Staff or Admin)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;

            if (permission != "3" && permission != "2")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập!"
                };
                return Unauthorized(res);
            }

            try
            {
                // Verify station exists
                var station = await _stationService.GetByIdAsync(stationId);
                if (station == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin trạm!"
                    };
                    return NotFound(res);
                }

                var rentals = await _rentalService.GetRentalsByStationAsync(stationId);

                // Filter by status if provided
                if (status.HasValue)
                {
                    rentals = rentals.Where(r => r.Status == status.Value);
                }

                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get pending rentals (Reserved status) for staff to process
        /// </summary>
        [HttpGet("GetPendingHandovers")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetPendingHandovers([FromQuery] int? stationId = null)
        {
            // Check user permission (Staff or Admin)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;

            if (permission != "3" && permission != "2")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập!"
                };
                return Unauthorized(res);
            }

            try
            {
                var allRentals = await _rentalService.GetAllAsync();
                var pendingRentals = allRentals.Where(r => r.Status == (int)RentalStatus.Reserved);

                // Filter by station if provided
                if (stationId.HasValue)
                {
                    pendingRentals = pendingRentals.Where(r => r.StationID == stationId.Value);
                }

                return Ok(pendingRentals.OrderBy(r => r.RentalDate));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get ongoing rentals (OnGoing status) that need to be returned
        /// </summary>
        [HttpGet("GetPendingReturns")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetPendingReturns([FromQuery] int? stationId = null)
        {
            // Check user permission (Staff or Admin)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;

            if (permission != "3" && permission != "2")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập!"
                };
                return Unauthorized(res);
            }

            try
            {
                var allRentals = await _rentalService.GetAllAsync();
                var ongoingRentals = allRentals.Where(r => r.Status == (int)RentalStatus.OnGoing);

                // Filter by station if provided
                if (stationId.HasValue)
                {
                    ongoingRentals = ongoingRentals.Where(r => r.StationID == stationId.Value);
                }

                return Ok(ongoingRentals.OrderBy(r => r.ReturnDate));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #endregion Rental Status Management
    }
}