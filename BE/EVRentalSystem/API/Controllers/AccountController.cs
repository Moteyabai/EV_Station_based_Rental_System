using AutoMapper;
using BusinessObject.Models;
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
        private readonly IMapper _mapper;
        private readonly IPasswordHasher<Account> _passwordHasher = new PasswordHasher<Account>();

        public AccountController(AccountService accountService, IMapper mapper)
        {
            _accountService = accountService;
            _mapper = mapper;
        }

        // GET: api/<AccountController>
        [HttpGet("AccountList")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccountList()
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
        public async Task<ActionResult<Account>> Login([FromBody] JWTLoginModel model)
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
        public async Task<ActionResult<Account>> Register([FromForm] AccountRegisterDTO accountRegisterDTO)
        {
            try
            {
                var acc = _mapper.Map<Account>(accountRegisterDTO);
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
                //Hash the password before saving
                acc.Password = _passwordHasher.HashPassword(acc, accountRegisterDTO.Password);

                await _accountService.AddAsync(acc);

                return Ok("Tạo tài khoản thành công!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // PUT api/<AccountController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<AccountController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}