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
                var error = new ErrorDTO();
                error.Error = "Không có quyền truy cập!";
                return Unauthorized(error);
            }
            try
            {
                var accounts = await _accountService.GetAllAsync();
                if (accounts == null || !accounts.Any())
                {
                    var error = new ErrorDTO();
                    error.Error = "Danh sách trống";
                    return NotFound(error);
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
                    var error = new ErrorDTO();
                    error.Error = "Nhập đầy đủ email và mật khẩu!";
                    return BadRequest(error);
                }
                var account = await _accountService.Login(model);

                return Ok(account);
            }
            catch (Exception ex)
            {
                var error = new ErrorDTO();
                error.Error = ex.Message;
                return BadRequest(error);
            }
        }

        // POST api/<AccountController>
        [HttpPost("Register")]
        public async Task<ActionResult<BusinessObject.Models.Account>> Register([FromForm] AccountRegisterDTO accountRegisterDTO)
        {
            try
            {
                var acc = _mapper.Map<BusinessObject.Models.Account>(accountRegisterDTO);
                if (acc == null)
                {
                    var error = new ErrorDTO();
                    error.Error = "Dữ liệu đăng ký không phù hợp!";
                    return BadRequest(error);
                }
                var checkEmail = await _accountService.CheckEmail(acc.Email);
                if (checkEmail)
                {
                    var error = new ErrorDTO();
                    error.Error = "Email đã tồn tại!";
                    return Conflict(error);
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

                return Ok("Tạo tài khoản thành công! Vui lòng chờ xác nhận giấy tờ trước khi đặt xe!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}