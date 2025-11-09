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
    public class RenterController : ControllerBase
    {
        private readonly RenterService _renterService;
        private readonly AccountService _accountService;
        private readonly IDDocumentService _idDocumentService;

        public RenterController(
            RenterService renterService,
            AccountService accountService,
            IDDocumentService idDocumentService)
        {
            _renterService = renterService;
            _accountService = accountService;
            _idDocumentService = idDocumentService;
        }

        /// <summary>
        /// Get all renters (Admin only)
        /// </summary>
        [HttpGet("GetAllRenters")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Renter>>> GetAllRenters()
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
                var renters = await _renterService.GetAllAsync();
                if (renters == null || !renters.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh sách người thuê trống"
                    };
                    return NotFound(res);
                }
                return Ok(renters);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get all renters with detailed information (Admin and Staff)
        /// </summary>
        [HttpGet("GetAllRentersDetailed")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<RenterDisplayDTO>>> GetAllRentersDetailed()
        {
            // Check user permission (Admin and Staff only)
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
                var renters = await _renterService.GetAllAsync();
                if (renters == null || !renters.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh sách người thuê trống"
                    };
                    return NotFound(res);
                }

                var displayDtos = new List<RenterDisplayDTO>();
                foreach (var renter in renters)
                {
                    var account = await _accountService.GetByIdAsync(renter.AccountID);
                    if (account == null) continue;

                    string documentStatus = "Chưa xác minh";
                    if (renter.DocumentID.HasValue)
                    {
                        var document = await _idDocumentService.GetByIdAsync(renter.DocumentID.Value);
                        if (document != null)
                        {
                            documentStatus = document.Status switch
                            {
                                0 => "Đang chờ",
                                1 => "Đã xác minh",
                                2 => "Từ chối",
                                _ => "Không xác định"
                            };
                        }
                    }

                    displayDtos.Add(new RenterDisplayDTO
                    {
                        RenterID = renter.RenterID,
                        AccountID = renter.AccountID,
                        FullName = account.FullName,
                        Email = account.Email,
                        Phone = account.Phone,
                        Avatar = account.Avatar,
                        DocumentID = renter.DocumentID,
                        DocumentStatus = documentStatus,
                        TotalRental = renter.TotalRental,
                        TotalSpent = renter.TotalSpent,
                        AccountCreatedAt = account.CreatedAt,
                        AccountStatus = account.Status
                    });
                }

                return Ok(displayDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get renter by ID with detailed information
        /// </summary>
        [HttpGet("GetRenterById/{id}")]
        [Authorize]
        public async Task<ActionResult<RenterDisplayDTO>> GetRenterByIdDetailed(int id)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                var renter = await _renterService.GetByIdAsync(id);
                if (renter == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin người thuê!"
                    };
                    return NotFound(res);
                }

                // Renters can only view their own information
                if (permission == "1" && renter.AccountID.ToString() != userId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có quyền truy cập thông tin này!"
                    };
                    return Unauthorized(res);
                }

                var account = await _accountService.GetByIdAsync(renter.AccountID);
                if (account == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin tài khoản!"
                    };
                    return NotFound(res);
                }

                string documentStatus = "Chưa xác minh";
                if (renter.DocumentID.HasValue)
                {
                    var document = await _idDocumentService.GetByIdAsync(renter.DocumentID.Value);
                    if (document != null)
                    {
                        documentStatus = document.Status switch
                        {
                            0 => "Đang chờ",
                            1 => "Đã xác minh",
                            2 => "Từ chối",
                            _ => "Không xác định"
                        };
                    }
                }

                var displayDto = new RenterDisplayDTO
                {
                    RenterID = renter.RenterID,
                    AccountID = renter.AccountID,
                    FullName = account.FullName,
                    Email = account.Email,
                    Phone = account.Phone,
                    Avatar = account.Avatar,
                    DocumentID = renter.DocumentID,
                    DocumentStatus = documentStatus,
                    TotalRental = renter.TotalRental,
                    TotalSpent = renter.TotalSpent,
                    AccountCreatedAt = account.CreatedAt,
                    AccountStatus = account.Status
                };

                return Ok(displayDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get renter by Account ID with detailed information
        /// </summary>
        [HttpGet("GetRenterByAccountID/{accountId}")]
        [Authorize]
        public async Task<ActionResult<RenterDisplayDTO>> GetRenterByAccountId(int accountId)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                // Renters can only view their own information
                if (permission == "1" && accountId.ToString() != userId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có quyền truy cập thông tin này!"
                    };
                    return Unauthorized(res);
                }

                var renter = await _renterService.GetRenterByAccountIDAsync(accountId);
                if (renter == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin người thuê!"
                    };
                    return NotFound(res);
                }

                var account = await _accountService.GetByIdAsync(renter.AccountID);
                if (account == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin tài khoản!"
                    };
                    return NotFound(res);
                }

                string documentStatus = "Chưa xác minh";
                if (renter.DocumentID.HasValue)
                {
                    var document = await _idDocumentService.GetByIdAsync(renter.DocumentID.Value);
                    if (document != null)
                    {
                        documentStatus = document.Status switch
                        {
                            0 => "Đang chờ",
                            1 => "Đã xác minh",
                            2 => "Từ chối",
                            _ => "Không xác định"
                        };
                    }
                }

                var displayDto = new RenterDisplayDTO
                {
                    RenterID = renter.RenterID,
                    AccountID = renter.AccountID,
                    FullName = account.FullName,
                    Email = account.Email,
                    Phone = account.Phone,
                    Avatar = account.Avatar,
                    DocumentID = renter.DocumentID,
                    DocumentStatus = documentStatus,
                    TotalRental = renter.TotalRental,
                    TotalSpent = renter.TotalSpent,
                    AccountCreatedAt = account.CreatedAt,
                    AccountStatus = account.Status
                };

                return Ok(displayDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get renter by Document ID (Staff and Admin only)
        /// </summary>
        [HttpGet("GetRenterByDocumentId/{documentId}")]
        [Authorize]
        public async Task<ActionResult<Renter>> GetRenterByDocumentId(int documentId)
        {
            // Check user permission (Staff and Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "2" && permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Không có quyền truy cập!"
                };
                return Unauthorized(res);
            }

            try
            {
                var renter = await _renterService.GetRenterByDocumentID(documentId);
                if (renter == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin người thuê!"
                    };
                    return NotFound(res);
                }

                return Ok(renter);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Create new renter
        /// </summary>
        [HttpPost("CreateRenter")]
        [Authorize]
        public async Task<ActionResult> CreateRenter([FromBody] RenterCreateDTO renterDto)
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
                // Check if account exists
                var account = await _accountService.GetByIdAsync(renterDto.AccountID);
                if (account == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Tài khoản không tồn tại!"
                    };
                    return NotFound(res);
                }

                // Check if account has correct role (Renter = 1)
                if (account.RoleID != 1)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Tài khoản này không phải là người thuê!"
                    };
                    return BadRequest(res);
                }

                // Check if renter already exists for this account
                var existingRenter = await _renterService.GetRenterByAccountIDAsync(renterDto.AccountID);
                if (existingRenter != null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Tài khoản này đã có thông tin người thuê!"
                    };
                    return BadRequest(res);
                }

                // Validate document if provided
                if (renterDto.DocumentID.HasValue)
                {
                    var document = await _idDocumentService.GetByIdAsync(renterDto.DocumentID.Value);
                    if (document == null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Giấy tờ không tồn tại!"
                        };
                        return NotFound(res);
                    }
                }

                var renter = new Renter
                {
                    AccountID = renterDto.AccountID,
                    DocumentID = renterDto.DocumentID,
                    TotalRental = 0,
                    TotalSpent = 0
                };

                await _renterService.AddAsync(renter);

                var successRes = new ResponseDTO
                {
                    Message = "Tạo thông tin người thuê thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Update renter information
        /// </summary>
        [HttpPut("UpdateRenter")]
        [Authorize]
        public async Task<ActionResult> UpdateRenter([FromBody] RenterUpdateDTO renterDto)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

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
                var existingRenter = await _renterService.GetByIdAsync(renterDto.RenterID);
                if (existingRenter == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin người thuê!"
                    };
                    return NotFound(res);
                }

                // Renters can only update their own information
                if (permission == "1" && existingRenter.AccountID.ToString() != userId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có quyền cập nhật thông tin này!"
                    };
                    return Unauthorized(res);
                }

                // Update document ID (all roles can update)
                if (renterDto.DocumentID.HasValue)
                {
                    // Validate document exists
                    var document = await _idDocumentService.GetByIdAsync(renterDto.DocumentID.Value);
                    if (document == null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Giấy tờ không tồn tại!"
                        };
                        return NotFound(res);
                    }
                    existingRenter.DocumentID = renterDto.DocumentID.Value;
                }

                // Only admin can update these fields
                if (permission == "3")
                {
                    if (renterDto.TotalRental.HasValue)
                        existingRenter.TotalRental = renterDto.TotalRental.Value;
                    if (renterDto.TotalSpent.HasValue)
                        existingRenter.TotalSpent = renterDto.TotalSpent.Value;
                }

                await _renterService.UpdateAsync(existingRenter);

                var successRes = new ResponseDTO
                {
                    Message = "Cập nhật thông tin người thuê thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete renter (Admin only)
        /// </summary>
        [HttpDelete("DeleteRenter/{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteRenter(int id)
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
                var renter = await _renterService.GetByIdAsync(id);
                if (renter == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin người thuê!"
                    };
                    return NotFound(res);
                }

                await _renterService.DeleteAsync(id);

                var successRes = new ResponseDTO
                {
                    Message = "Xóa thông tin người thuê thành công!"
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