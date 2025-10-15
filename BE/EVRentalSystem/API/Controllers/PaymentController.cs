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
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        public PaymentController(PaymentService paymentService)
        {
            _paymentService = paymentService;
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
        public async Task<ActionResult> CreatePayment([FromBody] PaymentCreateDTO paymentDto)
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
                var payment = new Payment
                {
                    RenterID = paymentDto.RenterID,
                    Amount = paymentDto.Amount,
                    RentalID = paymentDto.RentalID,
                    PaymentMethod = paymentDto.PaymentMethod,
                    PaymentType = paymentDto.PaymentType,
                    Status = paymentDto.Status,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                await _paymentService.AddAsync(payment);

                var successRes = new ResponseDTO
                {
                    Message = "Tạo giao dịch thanh toán thành công!"
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


        [HttpGet("GetPaymentsByRenter/{renterId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByRenter(int renterId)
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

                var payments = await _paymentService.GetPaymentsByRenterAsync(renterId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetPaymentsByRental/{rentalId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByRental(int rentalId)
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
                var payments = await _paymentService.GetPaymentsByRentalAsync(rentalId);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get payments by method
        /// </summary>
        [HttpGet("GetPaymentsByMethod/{method}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByMethod(int method)
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
                var payments = await _paymentService.GetPaymentsByMethodAsync(method);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("GetPaymentsByType/{type}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPaymentsByType(int type)
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
                var payments = await _paymentService.GetPaymentsByTypeAsync(type);
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("GetPendingPayments")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetPendingPayments()
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
                var payments = await _paymentService.GetPendingPaymentsAsync();
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("GetCompletedPayments")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetCompletedPayments()
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
                var payments = await _paymentService.GetCompletedPaymentsAsync();
                return Ok(payments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("GetFailedPayments")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Payment>>> GetFailedPayments()
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
                var payments = await _paymentService.GetFailedPaymentsAsync();
                return Ok(payments);
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

        [HttpGet("GetTotalAmountByRenter/{renterId}")]
        [Authorize]
        public async Task<ActionResult<decimal>> GetTotalAmountByRenter(int renterId)
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

                var totalAmount = await _paymentService.GetTotalAmountByRenterAsync(renterId);
                return Ok(new { RenterID = renterId, TotalAmount = totalAmount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}