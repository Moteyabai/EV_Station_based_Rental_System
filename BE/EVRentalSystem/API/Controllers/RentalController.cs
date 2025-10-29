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
    public class RentalController : ControllerBase
    {
        private readonly RentalService _rentalService;
        private readonly StationStaffService _stationStaffService;
        private readonly RenterService _renterService;

        public RentalController(RentalService rentalService, StationStaffService stationStaffService, RenterService renterService)
        {
            _rentalService = rentalService;
            _stationStaffService = stationStaffService;
            _renterService = renterService;
        }

        /// <summary>
        /// Get all rentals (Admin only)
        /// </summary>
        [HttpGet("GetAllRentals")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetAllRentals()
        {
            // Check user permission
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
                var rentals = await _rentalService.GetAllAsync();
                if (rentals == null || !rentals.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh sách thuê xe trống"
                    };
                    return NotFound(res);
                }
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get rental by ID
        /// </summary>
        [HttpGet("GetRentalById/{id}")]
        [Authorize]
        public async Task<ActionResult<Rental>> GetRentalById(int id)
        {
            try
            {
                var rental = await _rentalService.GetByIdAsync(id);
                if (rental == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thuê xe!"
                    };
                    return NotFound(res);
                }

                // Check if user can access this rental (Renter can only see their own rentals)
                var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
                var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

                if (permission == "1") // Renter
                {
                    if (rental.RenterID.ToString() != userId)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Không có quyền truy cập thông tin này!"
                        };
                        return Forbid();
                    }
                }

                return Ok(rental);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Create new rental
        /// </summary>
        [HttpPost("CreateRental")]
        [Authorize]
        public async Task<ActionResult> CreateRental([FromBody] RentalCreateDTO rentalDto)
        {
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
                // Validate dates
                if (rentalDto.ReservedDate.HasValue && rentalDto.ReservedDate >= rentalDto.RentalDate)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Ngày đặt trước phải trước ngày thuê!"
                    };
                    return BadRequest(res);
                }

                if (rentalDto.ReturnDate.HasValue && rentalDto.ReturnDate <= rentalDto.RentalDate)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Ngày trả xe phải sau ngày thuê!"
                    };
                    return BadRequest(res);
                }

                var rental = new Rental
                {
                    BikeID = rentalDto.BikeID,
                    RenterID = rentalDto.RenterID,
                    StationID = rentalDto.StationID,
                    AssignedStaff = rentalDto.AssignedStaff,
                    InitialBattery = rentalDto.InitialBattery,
                    InitBikeCondition = rentalDto.InitBikeCondition,
                    RentalDate = rentalDto.RentalDate,
                    ReservedDate = rentalDto.ReservedDate,
                    ReturnDate = rentalDto.ReturnDate,
                    Deposit = rentalDto.Deposit,
                    Fee = rentalDto.Fee
                };

                await _rentalService.AddAsync(rental);

                var successRes = new ResponseDTO
                {
                    Message = "Tạo đơn thuê xe thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Update rental information
        /// </summary>
        [HttpPut("UpdateRental")]
        [Authorize]
        public async Task<ActionResult> UpdateRental([FromBody] RentalUpdateDTO rentalDto)
        {
            // Check user permission (only staff and admin can update rentals)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3" && permission != "2")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy c?p!"
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
                var existingRental = await _rentalService.GetByIdAsync(rentalDto.RentalID);
                if (existingRental == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thuê xe!"
                    };
                    return NotFound(res);
                }

                // Update only provided fields
                if (rentalDto.BikeID.HasValue)
                    existingRental.BikeID = rentalDto.BikeID.Value;
                if (rentalDto.RenterID.HasValue)
                    existingRental.RenterID = rentalDto.RenterID.Value;
                if (rentalDto.StationID.HasValue)
                    existingRental.StationID = rentalDto.StationID.Value;
                if (rentalDto.AssignedStaff.HasValue)
                    existingRental.AssignedStaff = rentalDto.AssignedStaff;
                if (rentalDto.InitialBattery.HasValue)
                    existingRental.InitialBattery = rentalDto.InitialBattery.Value;
                if (rentalDto.FinalBattery.HasValue)
                    existingRental.FinalBattery = rentalDto.FinalBattery.Value;
                if (!string.IsNullOrEmpty(rentalDto.InitBikeCondition))
                    existingRental.InitBikeCondition = rentalDto.InitBikeCondition;
                if (!string.IsNullOrEmpty(rentalDto.FinalBikeCondition))
                    existingRental.FinalBikeCondition = rentalDto.FinalBikeCondition;
                if (rentalDto.RentalDate.HasValue)
                    existingRental.RentalDate = rentalDto.RentalDate.Value;
                if (rentalDto.ReservedDate.HasValue)
                    existingRental.ReservedDate = rentalDto.ReservedDate;
                if (rentalDto.ReturnDate.HasValue)
                    existingRental.ReturnDate = rentalDto.ReturnDate;
                if (rentalDto.Deposit.HasValue)
                    existingRental.Deposit = rentalDto.Deposit.Value;
                if (rentalDto.Fee.HasValue)
                    existingRental.Fee = rentalDto.Fee;

                await _rentalService.UpdateAsync(existingRental);

                var successRes = new ResponseDTO
                {
                    Message = "Cập nhật thông tin thuê xe thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Return bike (complete rental)
        /// </summary>
        [HttpPut("ReturnBike")]
        [Authorize]
        public async Task<ActionResult> ReturnBike([FromBody] RentalReturnDTO returnDto)
        {
            // Check user permission (only staff and admin can process returns)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
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
                    Message = "Dữ liệu không phù hợp!"
                };
                return BadRequest(res);
            }

            try
            {
                var res = new ResponseDTO();
                var rental = await _rentalService.GetByIdAsync(returnDto.RentalID);
                if (rental == null)
                {
                    res.Message = "Không tìm thấy thông tin thuê xe!";
                    return NotFound(res);
                }

                var renter = await _renterService.GetByIdAsync(rental.RenterID);
                if (renter == null)
                {
                    res.Message = "Không tìm thấy thông tin người thuê!";
                    return NotFound(res);
                }

                var staff = await _stationStaffService.GetByIdAsync(rental.AssignedStaff.Value);
                if (staff == null)
                {
                    res.Message = "Không tìm thấy thông tin nhân viên!";
                    return NotFound(res);
                }

                // Check if rental is already completed
                if (rental.ReturnDate.HasValue && rental.ReturnDate <= DateTime.Now)
                {
                    res.Message = "Đơn thuê xe đã được hoàn thành trước đó!";
                    return BadRequest(res);
                }

                // Update return information
                rental.FinalBattery = returnDto.FinalBattery;
                rental.FinalBikeCondition = returnDto.FinalBikeCondition;
                rental.ReturnDate = returnDto.ReturnDate;
                rental.Note = returnDto.Note;
                rental.Status = (int)RentalStatus.Completed;
                if (returnDto.Fee.HasValue)
                    rental.Fee = returnDto.Fee;

                await _rentalService.UpdateAsync(rental);

                //Update staff return count
                staff.ReceiveTimes += 1;

                await _stationStaffService.UpdateAsync(staff);

                //Update renter's total rentals & total spent
                renter.TotalRental += 1;
                renter.TotalSpent += rental.Deposit + (rental.Fee.HasValue ? rental.Fee.Value : 0);
                await _renterService.UpdateAsync(renter);

                res.Message = "Trả xe thành công!";

                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("HandOverBike/{id}")]
        [Authorize]
        public async Task<ActionResult> HandOverBike(int rentalId)
        {
            // Check user permission (only staff and admin can hand over bikes)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var accID = int.Parse(User.FindFirst(UserClaimTypes.AccountID).Value);
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
                var res = new ResponseDTO();
                var rental = await _rentalService.GetByIdAsync(rentalId);
                if (rental == null)
                {
                    res.Message = "Không tìm thấy thông tin thuê xe!";
                    return NotFound(res);
                }

                var staff = await _stationStaffService.GetStaffByAccountID(accID);
                if (staff == null)
                {
                    res.Message = "Không tìm thấy thông tin nhân viên!";
                    return NotFound(res);
                }
                // Update handover status
                rental.AssignedStaff = staff.StaffID;
                rental.Status = (int)RentalStatus.OnGoing;

                await _rentalService.UpdateAsync(rental);

                //Update staff handover count
                staff.HandoverTimes += 1;

                await _stationStaffService.UpdateAsync(staff);

                res.Message = "Bàn giao xe thành công!";

                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete rental (Admin only)
        /// </summary>
        [HttpDelete("DeleteRental/{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteRental(int id)
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
                var rental = await _rentalService.GetByIdAsync(id);
                if (rental == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thuê xe!"
                    };
                    return NotFound(res);
                }

                await _rentalService.DeleteAsync(id);

                var successRes = new ResponseDTO
                {
                    Message = "Xóa thông tin thuê xe thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get rentals by renter ID
        /// </summary>
        [HttpGet("GetRentalsByRenter/{renterId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetRentalsByRenter(int renterId)
        {
            try
            {
                // Check permission (Renter can only see their own, staff/admin can see all)
                var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
                var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

                if (permission == "1" && renterId.ToString() != userId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có quyền truy cập thông tin này!"
                    };
                    return Forbid();
                }

                var rentals = await _rentalService.GetRentalsByRenterAsync(renterId);
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get rentals by bike ID
        /// </summary>
        [HttpGet("GetRentalsByBike/{bikeId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetRentalsByBike(int bikeId)
        {
            // Check user permission (Staff and Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3" && permission != "2")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy c?p!"
                };
                return Unauthorized(res);
            }

            try
            {
                var rentals = await _rentalService.GetRentalsByBikeAsync(bikeId);
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get rentals by station ID
        /// </summary>
        [HttpGet("GetRentalsByStation/{stationId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetRentalsByStation(int stationId)
        {
            // Check user permission (Staff and Admin only)
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
                var rentals = await _rentalService.GetRentalsByStationAsync(stationId);
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get active rentals (currently being rented)
        /// </summary>
        [HttpGet("GetActiveRentals")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetActiveRentals()
        {
            // Check user permission (Staff and Admin only)
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
                var rentals = await _rentalService.GetActiveRentalsAsync();
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get pending rentals (future bookings)
        /// </summary>
        [HttpGet("GetPendingRentals")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetPendingRentals()
        {
            // Check user permission (Staff and Admin only)
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
                var rentals = await _rentalService.GetPendingRentalsAsync();
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get completed rentals
        /// </summary>
        [HttpGet("GetCompletedRentals")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetCompletedRentals()
        {
            // Check user permission (Staff and Admin only)
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
                var rentals = await _rentalService.GetCompletedRentalsAsync();
                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Search rentals with filters
        /// </summary>
        [HttpPost("SearchRentals")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> SearchRentals([FromBody] RentalSearchDTO searchDto)
        {
            // Check user permission (Staff and Admin only)
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
                var rentals = await _rentalService.GetAllAsync();

                // Apply filters
                if (searchDto.RenterID.HasValue)
                {
                    rentals = rentals.Where(r => r.RenterID == searchDto.RenterID.Value);
                }

                if (searchDto.BikeID.HasValue)
                {
                    rentals = rentals.Where(r => r.BikeID == searchDto.BikeID.Value);
                }

                if (searchDto.StationID.HasValue)
                {
                    rentals = rentals.Where(r => r.StationID == searchDto.StationID.Value);
                }

                if (searchDto.StartDate.HasValue)
                {
                    rentals = rentals.Where(r => r.RentalDate >= searchDto.StartDate.Value);
                }

                if (searchDto.EndDate.HasValue)
                {
                    rentals = rentals.Where(r => r.RentalDate <= searchDto.EndDate.Value);
                }

                if (!string.IsNullOrEmpty(searchDto.Status))
                {
                    var currentDate = DateTime.Now;
                    switch (searchDto.Status.ToLower())
                    {
                        case "active":
                            rentals = rentals.Where(r => r.RentalDate <= currentDate &&
                                                        (!r.ReturnDate.HasValue || r.ReturnDate >= currentDate));
                            break;

                        case "pending":
                            rentals = rentals.Where(r => r.RentalDate > currentDate);
                            break;

                        case "completed":
                            rentals = rentals.Where(r => r.ReturnDate.HasValue && r.ReturnDate < currentDate);
                            break;
                    }
                }

                return Ok(rentals);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}