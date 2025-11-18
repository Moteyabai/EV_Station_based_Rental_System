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
        private readonly AccountService _accountService;
        private readonly EVBikeService _evBikeService;
        private readonly EVBike_StocksService _evBikeStocksService;
        private readonly StationService _stationService;
        private readonly PaymentService _paymentService;

        public RentalController(RentalService rentalService, StationStaffService stationStaffService
            , RenterService renterService, AccountService accountService, EVBikeService eVBikeService
            , EVBike_StocksService eVBikeStocksService, StationService stationService, PaymentService paymentService)
        {
            _rentalService = rentalService;
            _stationStaffService = stationStaffService;
            _renterService = renterService;
            _accountService = accountService;
            _evBikeService = eVBikeService;
            _evBikeStocksService = eVBikeStocksService;
            _stationService = stationService;
            _paymentService = paymentService;
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
        public async Task<ActionResult<RentalDisplayDTO>> GetRentalById(int id)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            if (permission != "1" && permission != "2")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập thông tin này!"
                };
                return Unauthorized(res);
            }
            try
            {
                var res = new ResponseDTO();
                var rental = await _rentalService.GetRentalByIDAsync(id);
                if (rental == null)
                {
                    res.Message = "Không tìm thấy thông tin thuê xe!";
                    return NotFound(res);
                }

                var acc = await _accountService.GetByIdAsync(rental.Renter.AccountID);
                if (permission != "2" && acc.AccountId.ToString() != userId)
                {
                    res.Message = "Không có quyền truy cập thông tin này!";
                    return Unauthorized(res);
                }

                var bike = await _evBikeService.GetByIdAsync(rental.BikeID);
                if (bike == null)
                {
                    res.Message = "Không tìm thấy thông tin xe!";
                    return NotFound(res);
                }

                var station = await _stationService.GetByIdAsync(rental.StationID);
                if (station == null)
                {
                    res.Message = "Không tìm thấy thông tin trạm!";
                    return NotFound(res);
                }

                var payment = await _paymentService.GetDepositPaymentByRentalIDAsync(rental.RentalID);
                if (payment == null)
                {
                    res.Message = "Không tìm thấy thông tin thanh toán!";
                    return NotFound(res);
                }

                var displayDto = new RentalDisplayDTO
                {
                    RentalID = rental.RentalID,
                    BikeID = rental.BikeID,
                    StationID = rental.StationID,
                    StationName = station.Name,
                    StationAddress = station.Address,
                    BikeImage = bike.FrontImg,
                    BikeName = bike.BikeName,
                    LicensePlate = rental.LicensePlate,
                    RenterName = acc.FullName,
                    PhoneNumber = acc.Phone,
                    Email = acc.Email,
                    StartDate = rental.StartDate,
                    EndDate = rental.EndDate,
                    HandoverDate = rental.RentalDate,
                    ReturnDate = rental.ReturnDate,
                    AssignedStaff = rental.AssignedStaff,
                    InitialBattery = rental.InitialBattery,
                    FinalBattery = rental.FinalBattery,
                    InitBikeCondition = rental.InitBikeCondition,
                    FinalBikeCondition = rental.FinalBikeCondition,
                    CreatedAt = rental.CreatedAt,
                    UpdatedAt = rental.UpdatedAt,
                    Deposit = rental.Deposit,
                    Fee = rental.Fee,
                    PaymentMethod = payment.PaymentMethod,
                    Status = rental.Status,
                };

                return Ok(displayDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetRentalsAtStation/{accountID}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Rental>>> GetRentalsAtStation(int accountID)
        {
            // Check user permission
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
                var res = new ResponseDTO();

                var staff = await _stationStaffService.GetStaffByAccountID(accountID);
                if (staff == null)
                {
                    res.Message = "Không tìm thấy thông tin nhân viên!";
                    return NotFound(res);
                }

                if (staff.StationID == null)
                {
                    res.Message = "Nhân viên chưa được phân công trạm!";
                    return NotFound(res);
                }

                var rentals = await _rentalService.GetRentalsAtStaion(staff.StationID.Value);
                if (rentals == null || !rentals.Any())
                {
                    res.Message = "Không tìm thấy thông tin thuê xe!";
                    return NotFound(res);
                }

                var displayDtos = new List<RentalDisplayDTO>();
                foreach (var rental in rentals)
                {
                    var bike = await _evBikeService.GetByIdAsync(rental.BikeID);
                    if (bike == null)
                    {
                        res.Message = "Không tìm thấy thông tin xe!";
                        return NotFound(res);
                    }
                    var renter = await _renterService.GetByIdAsync(rental.RenterID);
                    if (renter == null)
                    {
                        res.Message = "Không tìm thấy thông tin người thuê!";
                        return NotFound(res);
                    }
                    var acc = await _accountService.GetByIdAsync(renter.AccountID);
                    if (acc == null)
                    {
                        res.Message = "Không tìm thấy thông tin tài khoản!";
                        return NotFound(res);
                    }
                    var payment = await _paymentService.GetDepositPaymentByRentalIDAsync(rental.RentalID);
                    if (payment == null)
                    {
                        res.Message = "Không tìm thấy thông tin thanh toán!";
                        return NotFound(res);
                    }
                    var displayDto = new RentalDisplayDTO();
                    displayDto.RentalID = rental.RentalID;
                    displayDto.BikeID = rental.BikeID;
                    displayDto.StationID = rental.StationID;
                    displayDto.BikeImage = bike.FrontImg;
                    displayDto.BikeName = bike.BikeName;
                    displayDto.LicensePlate = rental.LicensePlate;
                    displayDto.RenterName = acc.FullName;
                    displayDto.PhoneNumber = acc.Phone;
                    displayDto.Email = acc.Email;
                    displayDto.StartDate = rental.StartDate;
                    displayDto.EndDate = rental.EndDate;
                    displayDto.HandoverDate = rental.RentalDate;
                    displayDto.ReturnDate = rental.ReturnDate;
                    displayDto.AssignedStaff = rental.AssignedStaff;
                    displayDto.InitialBattery = rental.InitialBattery;
                    displayDto.FinalBattery = rental.FinalBattery;
                    displayDto.Deposit = rental.Deposit;
                    displayDto.Status = rental.Status;
                    displayDto.Fee = rental.Fee;
                    displayDto.CreatedAt = rental.CreatedAt;
                    displayDto.UpdatedAt = rental.UpdatedAt;
                    displayDto.PaymentMethod = payment.PaymentMethod;
                    displayDtos.Add(displayDto);
                }
                return Ok(displayDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetRentalsByAccountID/{accountID}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RentalDisplayDTO>>> GetRentalsByAccountID(int accountID)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            if (permission != "1" && permission != "2")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập thông tin này!"
                };
                return Unauthorized(res);
            }

            try
            {
                var res = new ResponseDTO();
                var renter = await _renterService.GetRenterByAccountIDAsync(accountID);
                if (renter == null)
                {
                    res.Message = "Không tìm thấy thông tin người thuê!";
                    return NotFound(res);
                }

                var rentals = await _rentalService.GetRentalsByRenterIDAsync(renter.RenterID);
                if (rentals == null || !rentals.Any())
                {
                    res.Message = "Không tìm thấy thông tin thuê xe!";
                    return NotFound(res);
                }

                var displayDtos = new List<RentalDisplayDTO>();
                foreach (var rental in rentals)
                {
                    var bike = await _evBikeService.GetByIdAsync(rental.BikeID);
                    if (bike == null)
                    {
                        res.Message = "Không tìm thấy thông tin xe!";
                        return NotFound(res);
                    }
                    var acc = await _accountService.GetByIdAsync(renter.AccountID);
                    if (acc == null)
                    {
                        res.Message = "Không tìm thấy thông tin tài khoản!";
                        return NotFound(res);
                    }
                    var station = await _stationService.GetByIdAsync(rental.StationID);
                    if (station == null)
                    {
                        res.Message = "Không tìm thấy thông tin trạm!";
                        return NotFound(res);
                    }

                    var payment = await _paymentService.GetDepositPaymentByRentalIDAsync(rental.RentalID);
                    if (payment == null)
                    {
                        res.Message = "Không tìm thấy thông tin thanh toán!";
                        return NotFound(res);
                    }
                    var displayDto = new RentalDisplayDTO();
                    displayDto.RentalID = rental.RentalID;
                    displayDto.BikeID = rental.BikeID;
                    displayDto.StationID = rental.StationID;
                    displayDto.StationAddress = station.Address;
                    displayDto.StationName = station.Name;
                    displayDto.BikeImage = bike.FrontImg;
                    displayDto.BikeName = bike.BikeName;
                    displayDto.LicensePlate = rental.LicensePlate;
                    displayDto.RenterName = acc.FullName;
                    displayDto.PhoneNumber = acc.Phone;
                    displayDto.Email = acc.Email;
                    displayDto.StartDate = rental.StartDate;
                    displayDto.EndDate = rental.EndDate;
                    displayDto.HandoverDate = rental.RentalDate;
                    displayDto.ReturnDate = rental.ReturnDate;
                    displayDto.AssignedStaff = rental.AssignedStaff;
                    displayDto.InitialBattery = rental.InitialBattery;
                    displayDto.FinalBattery = rental.FinalBattery;
                    displayDto.Deposit = rental.Deposit;
                    displayDto.Status = rental.Status;
                    displayDto.Fee = rental.Fee;
                    displayDto.CreatedAt = rental.CreatedAt;
                    displayDto.UpdatedAt = rental.UpdatedAt;
                    displayDto.PaymentMethod = payment.PaymentMethod;

                    displayDtos.Add(displayDto);
                }

                return Ok(displayDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetCompletedAndOngoingRentals")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RentalDisplayDTO>>> GetCompletedAndOngoingRentals()
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập thông tin này!"
                };
                return Unauthorized(res);
            }
            try
            {
                var rentals = await _rentalService.GetCompletedAndOngoingRentalAsync();
                if (rentals == null || !rentals.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thuê xe!"
                    };
                    return NotFound(res);
                }
                var displayDtos = new List<RentalDisplayDTO>();
                foreach (var rental in rentals)
                {
                    var bike = await _evBikeService.GetByIdAsync(rental.BikeID);
                    if (bike == null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Không tìm thấy thông tin xe!"
                        };
                        return NotFound(res);
                    }
                    var renter = await _renterService.GetByIdAsync(rental.RenterID);
                    if (renter == null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Không tìm thấy thông tin người thuê!"
                        };
                        return NotFound(res);
                    }
                    var acc = await _accountService.GetByIdAsync(renter.AccountID);
                    if (acc == null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Không tìm thấy thông tin tài khoản!"
                        };
                        return NotFound(res);
                    }
                    var payment = await _paymentService.GetDepositPaymentByRentalIDAsync(rental.RentalID);
                    if (payment == null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Không tìm thấy thông tin thanh toán!"
                        };
                        return NotFound(res);
                    }
                    var displayDto = new RentalDisplayDTO();
                    displayDto.RentalID = rental.RentalID;
                    displayDto.BikeID = rental.BikeID;
                    displayDto.StationID = rental.StationID;
                    displayDto.BikeImage = bike.FrontImg;
                    displayDto.BikeName = bike.BikeName;
                    displayDto.LicensePlate = rental.LicensePlate;
                    displayDto.RenterName = acc.FullName;
                    displayDto.PhoneNumber = acc.Phone;
                    displayDto.Email = acc.Email;
                    displayDto.StartDate = rental.StartDate;
                    displayDto.EndDate = rental.EndDate;
                    displayDto.HandoverDate = rental.RentalDate;
                    displayDto.ReturnDate = rental.ReturnDate;
                    displayDto.AssignedStaff = rental.AssignedStaff;
                    displayDto.InitialBattery = rental.InitialBattery;
                    displayDto.Status = rental.Status;

                    displayDtos.Add(displayDto);
                }

                return Ok(displayDtos);
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
                rental.ReturnDate = DateTime.Now;
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

        [HttpPut("HandOverBike")]
        [Authorize]
        public async Task<ActionResult> HandOverBike([FromQuery] int rentalId)
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
                rental.RentalDate = DateTime.Now;
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
    }
}