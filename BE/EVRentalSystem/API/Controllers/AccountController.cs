using Appwrite;
using Appwrite.Models;
using Appwrite.Services;
using AutoMapper;
using BusinessObject.Models;
using BusinessObject.Models.Appwrite;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.JWT;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Services;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly AccountService _accountService;
        private readonly IDDocumentService _idDocumentService;
        private readonly Client _appWriteClient;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher<BusinessObject.Models.Account> _passwordHasher = new PasswordHasher<BusinessObject.Models.Account>();

        public AccountController(AccountService accountService, IMapper mapper, IConfiguration configuration, IDDocumentService idDocumentService)
        {
            _accountService = accountService;
            _mapper = mapper;
            _configuration = configuration;
            AppwriteSettings appW = new AppwriteSettings()
            {
                ProjectId = configuration.GetValue<string>("Appwrite:ProjectId"),
                Endpoint = configuration.GetValue<string>("Appwrite:Endpoint"),
                ApiKey = configuration.GetValue<string>("Appwrite:ApiKey")
            };
            _appWriteClient = new Client().SetProject(appW.ProjectId).SetEndpoint(appW.Endpoint).SetKey(appW.ApiKey);
            _idDocumentService = idDocumentService;
        }

        // GET: api/<AccountController>
        [HttpGet("AccountList")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<BusinessObject.Models.Account>>> GetAccountList()
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
                var accounts = await _accountService.GetAllAsync();
                if (accounts == null || !accounts.Any())
                {
                    var res = new ResponseDTO();
                    res.Message = "Danh sách trống";
                    return NotFound(res);
                }

                return Ok(accounts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // GET api/<AccountController>/5
        [HttpPost("Login")]
        public async Task<ActionResult<BusinessObject.Models.Account>> Login([FromBody] JWTLoginModel model)
        {
            try
            {
                if (model.Email == null || string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
                {
                    var res = new ResponseDTO();
                    res.Message = "Nhập đầy đủ email và mật khẩu!";
                    return BadRequest(res);
                }
                var account = await _accountService.Login(model);

                return Ok(account);
            }
            catch (Exception ex)
            {
                var res = new ResponseDTO();
                res.Message = ex.Message;
                return BadRequest(res);
            }
        }

        // POST api/<AccountController>
        [HttpPost("Register")]
        public async Task<ActionResult<BusinessObject.Models.Account>> Register([FromForm] AccountRegisterDTO accountRegisterDTO)
        {
            try
            {
                var res = new ResponseDTO();
                var acc = _mapper.Map<BusinessObject.Models.Account>(accountRegisterDTO);
                if (acc == null)
                {
                    res.Message = "Dữ liệu đăng ký không phù hợp!";
                    return BadRequest(res);
                }
                var checkEmail = await _accountService.CheckEmail(acc.Email);
                if (checkEmail)
                {
                    res.Message = "Email đã tồn tại!";
                    return Conflict(res);
                }

                var storage = new Storage(_appWriteClient);
                var bucketID = "68dde8b0002f2952237f";
                var projectID = _configuration.GetValue<string>("Appwrite:ProjectId");

                List<string> perms = new List<string>() { Permission.Write(Appwrite.Role.Any()), Permission.Read(Appwrite.Role.Any()) };

                //Upload Avatar
                var avatarUID = Guid.NewGuid().ToString();
                var avatar = InputFile.FromStream(
                    accountRegisterDTO.AvatarPicture.OpenReadStream(),
                    accountRegisterDTO.AvatarPicture.FileName,
                    accountRegisterDTO.AvatarPicture.ContentType
                    );
                var response = await storage.CreateFile(
                            bucketID,
                            avatarUID,
                            avatar,
                            perms,
                            null
                            );

                var avatarID = response.Id;
                var avatarUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response.BucketId}/files/{avatarID}/view?project={projectID}";
                //Upload ID Front
                var IDFrontUID = Guid.NewGuid().ToString();
                var IDFront = InputFile.FromStream(
                    accountRegisterDTO.IDCardFront.OpenReadStream(),
                    accountRegisterDTO.IDCardFront.FileName,
                    accountRegisterDTO.IDCardFront.ContentType
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
                    accountRegisterDTO.IDCardBack.OpenReadStream(),
                    accountRegisterDTO.IDCardBack.FileName,
                    accountRegisterDTO.IDCardBack.ContentType
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
                    accountRegisterDTO.LicenseCardFront.OpenReadStream(),
                    accountRegisterDTO.LicenseCardFront.FileName,
                    accountRegisterDTO.LicenseCardFront.ContentType
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
                    accountRegisterDTO.LicenseCardBack.OpenReadStream(),
                    accountRegisterDTO.LicenseCardBack.FileName,
                    accountRegisterDTO.LicenseCardBack.ContentType
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
                //Hash the password before saving
                acc.Password = _passwordHasher.HashPassword(acc, accountRegisterDTO.Password);
                acc.RoleID = 1; //Default role is Customer
                acc.Avatar = avatarUrl;

                await _accountService.AddAsync(acc);

                //Create IDDocument
                var id = new IDDocument();
                id.AccountID = acc.AccountId;
                id.IDCardFront = IDFrontUrl;
                id.IDCardBack = IDBackUrl;
                id.LicenseCardFront = LSFrontUrl;
                id.LicenseCardBack = LSBackUrl;

                await _idDocumentService.AddAsync(id);

                res.Message = "Đăng ký thành công! Vui lòng đợi xác nhận giấy tờ trước khi đặt xe!";
                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("UpdateAccount")]
        [Authorize]
        public async Task<ActionResult<BusinessObject.Models.Account>> UpdateAccount([FromForm] AccountUpdateDTO accountUpdateDTO)
        {
            try
            {
                var res = new ResponseDTO();
                var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
                var userID = int.Parse(User.FindFirst(UserClaimTypes.AccountID).Value);
                if (permission != "3" && userID != accountUpdateDTO.AccountID)
                {
                    res.Message = "Không có quyền truy cập!";
                    return Unauthorized(res);
                }

                var existingAcc = await _accountService.GetByIdAsync(accountUpdateDTO.AccountID);
                if (existingAcc == null)
                {
                    res.Message = "Tài khoản không tồn tại!";
                    return NotFound(res);
                }
                var storage = new Storage(_appWriteClient);
                var bucketID = "68dde8b0002f2952237f";
                var projectID = _configuration.GetValue<string>("Appwrite:ProjectId");
                List<string> perms = new List<string>() { Permission.Write(Appwrite.Role.Any()), Permission.Read(Appwrite.Role.Any()) };
                //Upload Avatar
                if (accountUpdateDTO.Avatar != null)
                {
                    var avatarUID = Guid.NewGuid().ToString();
                    var avatar = InputFile.FromStream(
                        accountUpdateDTO.Avatar.OpenReadStream(),
                        accountUpdateDTO.Avatar.FileName,
                        accountUpdateDTO.Avatar.ContentType
                        );
                    var response = await storage.CreateFile(
                                bucketID,
                                avatarUID,
                                avatar,
                                perms,
                                null
                                );
                    var avatarID = response.Id;
                    var avatarUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response.BucketId}/files/{avatarID}/view?project={projectID}";
                    existingAcc.Avatar = avatarUrl;
                }

                existingAcc.FullName = accountUpdateDTO.FullName;
                existingAcc.Phone = accountUpdateDTO.PhoneNumber;

                //If user want
                await _accountService.UpdateAsync(existingAcc);
                res.Message = "Cập nhật thành công!";
                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("GetAccountById/{id}")]
        [Authorize]
        public async Task<ActionResult<BusinessObject.Models.Account>> GetAccountById(int id)
        {
            try
            {
                var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
                var userID = int.Parse(User.FindFirst(UserClaimTypes.AccountID).Value);
                if (permission != "3" && userID != id)
                {
                    var res = new ResponseDTO();
                    res.Message = "Không có quyền truy cập!";
                    return Unauthorized(res);
                }
                var account = await _accountService.GetByIdAsync(id);
                if (account == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Tài khoản không tồn tại!";
                    return NotFound(res);
                }
                return Ok(account);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPut("SuspenseAccount/{id}")]
        [Authorize]
        public async Task<ActionResult> SuspensenseAccount(int id)
        {
            try
            {
                var res = new ResponseDTO();
                var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
                if (permission != "3")
                {
                    res.Message = "Không có quyền truy cập!";
                    return Unauthorized(res);
                }
                var existingAcc = await _accountService.GetByIdAsync(id);
                if (existingAcc == null)
                {
                    res.Message = "Tài khoản không tồn tại!";
                    return NotFound(res);
                }

                existingAcc.Status = 3; //Set status to suspended
                await _accountService.DeleteAsync(id);
                res.Message = "Tài khoản đạ bị khóa!";
                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}