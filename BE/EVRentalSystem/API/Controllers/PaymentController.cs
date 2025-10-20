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
    /*[ApiController]*/
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;
        private readonly RenterService _renterService;
        private readonly RentalService _rentalService;
        private readonly AccountService _accountService;

        public PaymentController(PaymentService paymentService, RenterService renterService, RentalService rentalService
            , AccountService accountService)
        {
            _paymentService = paymentService;
            _renterService = renterService;
            _rentalService = rentalService;
            _accountService = accountService;
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
        public async Task<ActionResult> RenterCreatePayment(PaymentCreateDTO paymentDto)
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
                var account = await _accountService.GetByIdAsync(paymentDto.AccountID);
                if (account == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin tài khoản!"
                    };
                    return NotFound(res);
                }
                var renter = await _renterService.GetRenterByAccountIDAsync(paymentDto.AccountID);

                var rental = new Rental();
                rental.BikeID = paymentDto.BikeID;
                rental.RenterID = renter.RenterID;
                rental.StationID = paymentDto.StationID;
                rental.InitialBattery = 100; // Default initial battery
                rental.RentalDate = DateTime.Now;
                rental.Deposit = paymentDto.Amount;
                rental.Status = (int)RentalStatus.Reserved;

                await _rentalService.AddAsync(rental);
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
                var payment = await _paymentService.GetByIdAsync(orderID);
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

        [HttpPut("UpdatePaymentStatus")]
        [Authorize]
        public async Task<ActionResult> UpdatePaymentStatus([FromBody] PaymentStatusUpdateDTO statusDto)
        {
            // Check user permission (only staff and admin can update payment status)
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
                var payment = await _paymentService.GetByIdAsync(statusDto.PaymentID);
                if (payment == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin thanh toán!"
                    };
                    return NotFound(res);
                }

                payment.Status = statusDto.Status;
                payment.UpdatedAt = DateTime.Now;

                await _paymentService.UpdateAsync(payment);

                var successRes = new ResponseDTO
                {
                    Message = "Cập nhật trạng thái thanh toán thành công!"
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
                var payment = await _paymentService.GetByIdAsync(id);
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

        [HttpGet("GetPaymentStatistics")]
        [Authorize]
        public async Task<ActionResult<PaymentStatisticsDTO>> GetPaymentStatistics()
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
                var paymentsList = payments.ToList();

                var statistics = new PaymentStatisticsDTO
                {
                    TotalAmount = paymentsList.Sum(p => p.Amount),
                    TotalCount = paymentsList.Count,
                    CompletedCount = paymentsList.Count(p => p.Status == 1),
                    PendingCount = paymentsList.Count(p => p.Status == 0),
                    FailedCount = paymentsList.Count(p => p.Status == -1),
                    CompletedAmount = paymentsList.Where(p => p.Status == 1).Sum(p => p.Amount),
                    PendingAmount = paymentsList.Where(p => p.Status == 0).Sum(p => p.Amount),
                    FailedAmount = paymentsList.Where(p => p.Status == -1).Sum(p => p.Amount)
                };

                // Amount by method
                statistics.AmountByMethod = paymentsList
                    .GroupBy(p => p.PaymentMethod)
                    .ToDictionary(g => g.Key, g => g.Where(p => p.Status == 1).Sum(p => p.Amount));

                // Amount by type
                statistics.AmountByType = paymentsList
                    .GroupBy(p => p.PaymentType)
                    .ToDictionary(g => g.Key, g => g.Where(p => p.Status == 1).Sum(p => p.Amount));

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}