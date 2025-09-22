using BusinessObject.Models;
using Microsoft.AspNetCore.Authorization;
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

        public AccountController(AccountService accountService)
        {
            _accountService = accountService;
        }
        // GET: api/<AccountController>
        [HttpGet("AccountList")]
        public async Task<ActionResult<IEnumerable<Account>>> GetAccountList()
        {
            try
            {
                var accounts = await _accountService.GetAllAsync();
                if (accounts == null || !accounts.Any())
                {
                    return NotFound("No accounts found.");
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
        public async Task<ActionResult<Account>> Login([FromQuery] string email, [FromQuery] string password)
        {
            try
            {
                if (email == null || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    return BadRequest("Email and password must be provided.");
                }
                var account = await _accountService.Login(email, password);
                if (account == null)
                {
                    return Unauthorized("Invalid email or password.");
                }
                return Ok(account);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // POST api/<AccountController>
        [HttpPost]
        public void Post([FromBody] string value)
        {
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
