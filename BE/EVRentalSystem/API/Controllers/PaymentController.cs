using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.Enum;
using BusinessObject.Models.JWT;
using BusinessObject.Models.PayOS;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace API.Controllers
{
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly RenterService _renterService;
        private readonly RentalService _rentalService;
        private readonly AccountService _accountService;
        private readonly EVBikeService _evbikeService;
        private readonly EVBike_StocksService _evbike_StocksService;

        public PaymentController(PaymentService paymentService, RenterService renterService, RentalService rentalService
            , AccountService accountService, EVBikeService evbikeService, EVBike_StocksService evbike_StocksService)
        {
            _paymentService = paymentService;
            _renterService = renterService;
            _rentalService = rentalService;
            _accountService = accountService;
            _evbikeService = evbikeService;
            _evbike_StocksService = evbike_StocksService;
        }

        [HttpGet("GetAllPayments")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetAllPayments()
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
                var payments = await _paymentService.GetAllAsync();
                if (payments == null || !payments.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh sách thanh toán trống"
                    };
                    return NotFound(res);
                }
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetPaymentById/{id}")]
        [Authorize]
        public async Task<ActionResult<Payment>> GetPaymentById(int id)
        {
            try
            {
                var payment = await _paymentService.GetByIdAsync(id);
                if (payment == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thanh toán!"
                    };
                    return NotFound(res);
                }

                // Check if user can access this payment (Renter can only see their own payments)
                var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
                var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

                if (permission == "1") // Renter
                {
                    if (payment.RenterID.ToString() != userId)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Không có quyền truy cập thông tin này!"
                        };
                        return Forbid();
                    }
                }

                return Ok(payment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("CreatePayment")]
        [Authorize]
        public async Task<ActionResult> RenterCreatePayment([FromBody] PaymentCreateDTO paymentDto)
        {
            if (!ModelState.IsValid)
            {
                var res = new ResponseDTO();
                res.Message = "Dữ liệu không hợp lệ!";
                return BadRequest(res);
            }

            try
            {
                var res = new ResponseDTO();
                var account = await _accountService.GetByIdAsync(paymentDto.AccountID);
                if (account == null)
                {
                    res.Message = "Không tìm thấy thông tin tài khoản!";
                    return NotFound(res);
                }

                var bike = await _evbikeService.GetByIdAsync(paymentDto.BikeID);
                if (bike == null)
                {
                    res.Message = "Không tìm thấy thông tin xe!";
                    return NotFound(res);
                }

                var availableStock = await _evbike_StocksService.GetAvailableStockByBikeIDAsync(paymentDto.BikeID);
                if (availableStock == null)
                {
                    res.Message = "Hiện không còn xe trống để thuê!";
                    return BadRequest(res);
                }

                var renter = await _renterService.GetRenterByAccountIDAsync(paymentDto.AccountID);

                var rental = new Rental();
                rental.BikeID = bike.BikeID;
                rental.RenterID = renter.RenterID;
                rental.StationID = paymentDto.StationID;
                rental.InitialBattery = 100; // Default initial battery
                rental.RentalDate = DateTime.Now;
                rental.Deposit = paymentDto.Amount;
                rental.Status = (int)RentalStatus.Reserved;
                rental.LicensePlate = availableStock.LicensePlate;

                await _rentalService.AddAsync(rental);

                // Update bike stock status to Unavailable
                availableStock.Status = (int)BikeStatus.Unavailable;
                availableStock.UpdatedAt = DateTime.Now;

                await _evbike_StocksService.UpdateAsync(availableStock);

                // Update Bike quantity
                bike.Quantity -= 1;

                await _evbikeService.UpdateAsync(bike);


                long orderCode = int.Parse(DateTimeOffset.Now.ToString("ffffff"));

                var payment = new Payment
                {
                    PaymentID = orderCode,
                    RenterID = renter.RenterID,
                    Amount = paymentDto.Amount,
                    RentalID = rental.RentalID,
                    PaymentMethod = paymentDto.PaymentMethod,
                    PaymentType = paymentDto.PaymentType,
                    Status = (int)PaymentStatus.Pending,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                await _paymentService.AddAsync(payment);

                int expiredAt = (int)(DateTimeOffset.Now.ToUnixTimeSeconds() + (60 * 5));

                if (paymentDto.PaymentMethod == (int)PaymentMethod.PayOS)
                {
                    var paymentData = new CreatePaymentLinkRequest(

                        orderCode,
                        "Thuê xe",
                        (int)paymentDto.Amount,
                        account.FullName,
                        account.Email,
                        expiredAt
                    );

                    var paymentUrl = await _paymentService.CreatePaymentLink(paymentData);

                    var returnUrl = new PaymentLinkDTO();
                    returnUrl.PaymentUrl = paymentUrl;
                    return Ok(returnUrl);
                }

                res.Message = "Tạo thông tin thanh toán thành công!";

                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("success")]
        [Authorize]
        public async Task<ActionResult> RenterPaymentSuccess(int orderID)
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
                var payment = await _paymentService.GetPaymentByIDAsync(orderID);
                if (payment == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thanh toán!"
                    };
                    return NotFound(res);
                }
                payment.Status = (int)PaymentStatus.Completed;
                payment.UpdatedAt = DateTime.Now;
                await _paymentService.UpdateAsync(payment);

                // Update bike's TimeRented
                var bike = await _evbikeService.GetByIdAsync(payment.Rental.BikeID);
                if (bike == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin xe!"
                    };
                    return NotFound(res);
                }

                bike.TimeRented += 1;
                bike.UpdatedAt = DateTime.Now;

                await _evbikeService.UpdateAsync(bike);

                // Also update rental status to Reserved
                var rental = await _rentalService.GetByIdAsync(payment.RentalID);
                if (rental != null)
                {
                    rental.Status = (int)RentalStatus.Reserved;
                    rental.ReservedDate = DateTime.Now;
                    await _rentalService.UpdateAsync(rental);
                }

                var successRes = new ResponseDTO
                {
                    Message = "Thanh toán thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("failed")]
        [Authorize]
        public async Task<ActionResult> RenterPaymentFailed(int orderID)
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
                var payment = await _paymentService.GetPaymentByIDAsync(orderID);
                if (payment == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thanh toán!"
                    };
                    return NotFound(res);
                }
                payment.Status = (int)PaymentStatus.Failed;
                payment.UpdatedAt = DateTime.Now;
                await _paymentService.UpdateAsync(payment);

                // Also update rental status to Cancelled
                var rental = await _rentalService.GetByIdAsync(payment.RentalID);
                if (rental != null)
                {
                    rental.Status = (int)RentalStatus.Cancelled;
                    await _rentalService.UpdateAsync(rental);
                }

                // Return bike stock to Available
                var bikeStock = await _evbike_StocksService.GetStockByLicensePlateAsync(rental.LicensePlate);
                if (bikeStock != null)
                {
                    bikeStock.Status = (int)BikeStatus.Available;
                    bikeStock.UpdatedAt = DateTime.Now;
                    await _evbike_StocksService.UpdateAsync(bikeStock);
                    // Update Bike quantity
                    var bike = await _evbikeService.GetByIdAsync(bikeStock.BikeID);
                    if (bike != null)
                    {
                        bike.Quantity += 1;
                        await _evbikeService.UpdateAsync(bike);
                    }
                }
                var failedRes = new ResponseDTO
                {
                    Message = "Thanh toán thất bại!"
                };
                return Ok(failedRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("UpdatePayment")]
        [Authorize]
        public async Task<ActionResult> UpdatePayment([FromBody] PaymentUpdateDTO paymentDto)
        {
            // Check user permission (only staff and admin can update payments)
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
                    Message = "Dữ liệu không hợp lệ!"
                };
                return BadRequest(res);
            }

            try
            {
                var existingPayment = await _paymentService.GetByIdAsync(paymentDto.PaymentID);
                if (existingPayment == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thanh toán!"
                    };
                    return NotFound(res);
                }

                // Update only provided fields
                if (paymentDto.RenterID.HasValue)
                    existingPayment.RenterID = paymentDto.RenterID.Value;
                if (paymentDto.Amount.HasValue)
                    existingPayment.Amount = paymentDto.Amount.Value;
                if (paymentDto.RentalID.HasValue)
                    existingPayment.RentalID = paymentDto.RentalID.Value;
                if (paymentDto.PaymentMethod.HasValue)
                    existingPayment.PaymentMethod = paymentDto.PaymentMethod.Value;
                if (paymentDto.PaymentType.HasValue)
                    existingPayment.PaymentType = paymentDto.PaymentType.Value;
                if (paymentDto.Status.HasValue)
                    existingPayment.Status = paymentDto.Status.Value;

                existingPayment.UpdatedAt = DateTime.Now;

                await _paymentService.UpdateAsync(existingPayment);

                var successRes = new ResponseDTO
                {
                    Message = "Cập nhật thông tin thanh toán thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("DeletePayment/{id}")]
        [Authorize]
        public async Task<ActionResult> DeletePayment(int id)
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
                var payment = await _paymentService.GetPaymentByIDAsync(id);
                if (payment == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thanh toán!"
                    };
                    return NotFound(res);
                }

                await _paymentService.DeleteAsync(id);

                var successRes = new ResponseDTO
                {
                    Message = "Xóa thông tin thanh toán thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("SearchPayments")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> SearchPayments([FromBody] PaymentSearchDTO searchDto)
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
                var payments = await _paymentService.GetAllAsync();

                // Apply filters
                if (searchDto.RenterID.HasValue)
                {
                    payments = payments.Where(p => p.RenterID == searchDto.RenterID.Value);
                }

                if (searchDto.RentalID.HasValue)
                {
                    payments = payments.Where(p => p.RentalID == searchDto.RentalID.Value);
                }

                if (searchDto.PaymentMethod.HasValue)
                {
                    payments = payments.Where(p => p.PaymentMethod == searchDto.PaymentMethod.Value);
                }

                if (searchDto.PaymentType.HasValue)
                {
                    payments = payments.Where(p => p.PaymentType == searchDto.PaymentType.Value);
                }

                if (searchDto.Status.HasValue)
                {
                    payments = payments.Where(p => p.Status == searchDto.Status.Value);
                }

                if (searchDto.StartDate.HasValue)
                {
                    payments = payments.Where(p => p.CreatedAt >= searchDto.StartDate.Value);
                }

                if (searchDto.EndDate.HasValue)
                {
                    payments = payments.Where(p => p.CreatedAt <= searchDto.EndDate.Value);
                }

                if (searchDto.MinAmount.HasValue)
                {
                    payments = payments.Where(p => p.Amount >= searchDto.MinAmount.Value);
                }

                if (searchDto.MaxAmount.HasValue)
                {
                    payments = payments.Where(p => p.Amount <= searchDto.MaxAmount.Value);
                }

                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

       
    }
}