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
    public class IDDocumentController : ControllerBase
    {
        private readonly IDDocumentService _IDDocumentService;

        public IDDocumentController(IDDocumentService iDDocumentService)
        {
            _IDDocumentService = iDDocumentService;
        }

        [HttpGet("IDDocumentList")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<IDDocument>>> GetAccountList()
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
                var docs = await _IDDocumentService.GetAllAsync();
                if (docs == null || !docs.Any())
                {
                    var error = new ErrorDTO();
                    error.Error = "Danh sách trống";
                    return NotFound(error);
                }

                return Ok(docs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}