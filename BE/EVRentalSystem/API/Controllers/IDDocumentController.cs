using Appwrite;
using Appwrite.Models;
using Appwrite.Services;
using BusinessObject.Models;
using BusinessObject.Models.Appwrite;
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
    public class IDDocumentController : ControllerBase
    {
        private readonly IDDocumentService _IDDocumentService;
        private readonly Client _appWriteClient;
        private readonly RenterService _renterService;
        private readonly StationStaffService _stationStaffService;
        private readonly IConfiguration _configuration;

        public IDDocumentController(IDDocumentService iDDocumentService, IConfiguration configuration
, RenterService renterService, StationStaffService stationStaffService)
        {
            _IDDocumentService = iDDocumentService;
            _configuration = configuration;
            AppwriteSettings appW = new AppwriteSettings()
            {
                ProjectId = configuration.GetValue<string>("Appwrite:ProjectId"),
                Endpoint = configuration.GetValue<string>("Appwrite:Endpoint"),
                ApiKey = configuration.GetValue<string>("Appwrite:ApiKey")
            };
            _appWriteClient = new Client().SetProject(appW.ProjectId).SetEndpoint(appW.Endpoint).SetKey(appW.ApiKey);
            _renterService = renterService;
            _stationStaffService = stationStaffService;
        }

        [HttpGet("IDDocumentList")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<IDDocument>>> GetAccountList()
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            if (permission != "3")
            {
                var res = new ResponseDTO();
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                var docs = await _IDDocumentService.GetAllAsync();
                if (docs == null || !docs.Any())
                {
                    var res = new ResponseDTO();
                    res.Message = "Danh sách trống";
                    return NotFound(res);
                }

                return Ok(docs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("IDDocumentPendingList")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<IDDocument>>> GetPendingIDDocumentList()
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            if (permission != "3" && permission != "2")
            {
                var res = new ResponseDTO();
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                var docs = await _IDDocumentService.GetPendingDocumentsAsync();
                if (docs == null || !docs.Any())
                {
                    var res = new ResponseDTO();
                    res.Message = "Danh sách trống";
                    return NotFound(res);
                }
                return Ok(docs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("GetIDDocumentById/{id}")]
        [Authorize]
        public async Task<ActionResult<IDDocument>> GetIDDocumentById(int id)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            if (permission != "3")
            {
                var res = new ResponseDTO();
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                var doc = await _IDDocumentService.GetByIdAsync(id);
                if (doc == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Không tìm thấy tài liệu";
                    return NotFound(res);
                }
                return Ok(doc);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("GetIDDocumentByAccountId/{accountId}")]
        [Authorize]
        public async Task<ActionResult<IDDocument>> GetIDDocumentByAccountId(int accountId)
        {
            try
            {
                var renter = await _renterService.GetRenterByAccountIDAsync(accountId);
                if (renter == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Người thuê không tồn tại!";
                    return NotFound(res);
                }

                var IDDoc = await _IDDocumentService.GetByIdAsync(renter.DocumentID.Value);
                if (IDDoc == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Không tìm thấy tài liệu";
                    return NotFound(res);
                }

                return Ok(IDDoc);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("RenterUpdateIDDocument/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateIDDocument([FromBody] IDocumentUpdateDTO updatedDocument)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            var accountId = int.Parse(User.FindFirst(UserClaimTypes.AccountID).Value);
            if (permission != "3" && updatedDocument.AccountID != accountId)
            {
                var res = new ResponseDTO();
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }

            try
            {
                var renter = await _renterService.GetRenterByAccountIDAsync(updatedDocument.AccountID);
                if (renter == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Người thuê không tồn tại!";
                    return NotFound(res);
                }
                if (renter.DocumentID == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Người thuê chưa có tài liệu để cập nhật!";
                    return NotFound(res);
                }
                var existingDocument = await _IDDocumentService.GetByIdAsync(renter.DocumentID.Value);
                if (existingDocument == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Không tìm thấy tài liệu";
                    return NotFound(res);
                }

                var storage = new Storage(_appWriteClient);
                var bucketID = _configuration.GetValue<string>("Appwrite:BucketId");
                var projectID = _configuration.GetValue<string>("Appwrite:ProjectId");

                List<string> perms = new List<string>() { Permission.Write(Appwrite.Role.Any()), Permission.Read(Appwrite.Role.Any()) };

                //Upload ID Front
                var IDFrontUID = Guid.NewGuid().ToString();
                var IDFront = InputFile.FromStream(
                    updatedDocument.IDCardFront.OpenReadStream(),
                    updatedDocument.IDCardFront.FileName,
                    updatedDocument.IDCardFront.ContentType
                    );
                var response1 = await storage.CreateFile(
                            bucketID,
                            IDFrontUID,
                            IDFront,
                            perms,
                            null
                            );

                var IDFrontID = response1.Id;
                var IDFrontUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response1.BucketId}/files/{IDFrontID}/view?project={projectID}";
                //Upload ID Back
                var IDBackUID = Guid.NewGuid().ToString();
                var IDBack = InputFile.FromStream(
                    updatedDocument.IDCardBack.OpenReadStream(),
                    updatedDocument.IDCardBack.FileName,
                    updatedDocument.IDCardBack.ContentType
                    );
                var response2 = await storage.CreateFile(
                            bucketID,
                            IDBackUID,
                            IDBack,
                            perms,
                            null
                            );

                var IDBackID = response2.Id;
                var IDBackUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response2.BucketId}/files/{IDBackID}/view?project={projectID}";
                //Upload License Front
                var LSFrontUID = Guid.NewGuid().ToString();
                var LSFront = InputFile.FromStream(
                    updatedDocument.LicenseCardFront.OpenReadStream(),
                    updatedDocument.LicenseCardFront.FileName,
                    updatedDocument.LicenseCardFront.ContentType
                    );
                var response3 = await storage.CreateFile(
                            bucketID,
                            LSFrontUID,
                            LSFront,
                            perms,
                            null
                            );

                var LSFrontID = response3.Id;
                var LSFrontUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response3.BucketId}/files/{LSFrontID}/view?project={projectID}";
                //Upload License Back
                var LSBackUID = Guid.NewGuid().ToString();
                var LSBack = InputFile.FromStream(
                    updatedDocument.LicenseCardBack.OpenReadStream(),
                    updatedDocument.LicenseCardBack.FileName,
                    updatedDocument.LicenseCardBack.ContentType
                    );
                var response4 = await storage.CreateFile(
                            bucketID,
                            LSBackUID,
                            LSBack,
                            perms,
                            null
                            );

                var LSBackID = response4.Id;
                var LSBackUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response4.BucketId}/files/{LSBackID}/view?project={projectID}";

                //Update document details
                existingDocument.IDCardFront = IDFrontUrl;
                existingDocument.IDCardBack = IDBackUrl;
                existingDocument.LicenseCardFront = LSFrontUrl;
                existingDocument.LicenseCardBack = LSBackUrl;
                existingDocument.Status = (int)DocumentStatus.Pending;
                existingDocument.UpdatedAt = DateTime.Now;

                await _IDDocumentService.UpdateAsync(existingDocument);

                var response = new ResponseDTO
                {
                    Message = "Cập nhật giấy tờ thành công, vui lòng chờ xác nhận!"
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("VerifyDocument")]
        [Authorize]
        public async Task<IActionResult> VerifyDocument([FromBody] VerifyIDDTO verifyIDDTO)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            if (permission != "2" && permission != "3")
            {
                var res = new ResponseDTO();
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                var staff = await _stationStaffService.GetStaffByAccountID(verifyIDDTO.VerifiedByStaffID);
                if (staff == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Nhân viên không tồn tại!";
                    return NotFound(res);
                }

                var existingDocument = await _IDDocumentService.GetByIdAsync(verifyIDDTO.DocumentID);
                if (existingDocument == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Không tìm thấy tài liệu";
                    return NotFound(res);
                }

                existingDocument.UpdatedAt = DateTime.Now;
                existingDocument.Note = verifyIDDTO.Note;
                existingDocument.VerifiedByStaffID = staff.StaffID;
                existingDocument.FullName = verifyIDDTO.Name;
                existingDocument.DateOfBirth = verifyIDDTO.DateOfBirth;
                existingDocument.IDNumber = verifyIDDTO.IDNumber;
                existingDocument.LicenseNumber = verifyIDDTO.LicenseNumber;

                if (verifyIDDTO.Status == (int)DocumentStatus.Approved)
                {
                    existingDocument.Status = (int)DocumentStatus.Approved;
                }
                else if (verifyIDDTO.Status == (int)DocumentStatus.Rejected)
                {
                    existingDocument.Status = (int)DocumentStatus.Rejected;
                }
                await _IDDocumentService.UpdateAsync(existingDocument);
                var response = new ResponseDTO
                {
                    Message = verifyIDDTO.Status == (int)DocumentStatus.Approved ? "Tài liệu đã được phê duyệt." : "Tài liệu đã bị từ chối."
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}