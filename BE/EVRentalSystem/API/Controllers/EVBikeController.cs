﻿using Appwrite;
using Appwrite.Models;
using Appwrite.Services;
using BusinessObject.Models;
using BusinessObject.Models.Appwrite;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.JWT;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EVBikeController : ControllerBase
    {
        private readonly EVBikeService _evBikeService;
        private readonly Client _appWriteClient;
        private readonly IConfiguration _configuration;

        public EVBikeController(EVBikeService evBikeService, IConfiguration configuration)
        {
            _evBikeService = evBikeService;
            _configuration = configuration;
            AppwriteSettings appW = new AppwriteSettings()
            {
                ProjectId = configuration.GetValue<string>("Appwrite:ProjectId"),
                Endpoint = configuration.GetValue<string>("Appwrite:Endpoint"),
                ApiKey = configuration.GetValue<string>("Appwrite:ApiKey")
            };
            _appWriteClient = new Client().SetProject(appW.ProjectId).SetEndpoint(appW.Endpoint).SetKey(appW.ApiKey);
        }

        [HttpGet("EVBikeList")]
        [Authorize]
        public async Task<ActionResult<EVBike>> GetAllBikes()
        {
            // Check user permission
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            if (permission != "3")
            {
                var res = new ResponseDTO();
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                // Get all bikes
                var bikes = await _evBikeService.GetAllAsync();
                if (bikes == null || !bikes.Any())
                {
                    var res = new ResponseDTO();
                    res.Message = "Danh sách trống";
                    return NotFound(res);
                }
                return Ok(bikes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("AddBike")]
        [Authorize]
        public async Task<ActionResult> AddBike([FromForm] EVBikeCreateDTO eVBikeCreateDTO)
        {
            //Check user permission
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            if (permission != "3")
            {
                var res = new ResponseDTO();
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            if (!ModelState.IsValid)
            {
                var res = new ResponseDTO();
                res.Message = ModelState.ToString();
                return BadRequest(res);
            }
            try
            {
                // Upload images to Appwrite
                var storage = new Storage(_appWriteClient);
                var bucketID = _configuration.GetValue<string>("Appwrite:BucketId"); ;
                var projectID = _configuration.GetValue<string>("Appwrite:ProjectId");

                List<string> perms = new List<string>() { Permission.Write(Appwrite.Role.Any()), Permission.Read(Appwrite.Role.Any()) };

                //Upload Bike Front Image
                var frontUID = Guid.NewGuid().ToString();
                var front = InputFile.FromStream(
                    eVBikeCreateDTO.FrontImg.OpenReadStream(),
                    eVBikeCreateDTO.FrontImg.FileName,
                    eVBikeCreateDTO.FrontImg.ContentType
                    );
                var response = await storage.CreateFile(
                            bucketID,
                            frontUID,
                            front,
                            perms,
                            null
                            );

                var frontID = response.Id;
                var frontUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response.BucketId}/files/{frontID}/view?project={projectID}";
                //Upload Bike Back Image
                var backUID = Guid.NewGuid().ToString();
                var back = InputFile.FromStream(
                    eVBikeCreateDTO.BackImg.OpenReadStream(),
                    eVBikeCreateDTO.BackImg.FileName,
                    eVBikeCreateDTO.BackImg.ContentType
                    );
                var response2 = await storage.CreateFile(
                            bucketID,
                            backUID,
                            back,
                            perms,
                            null
                            );
                var backID = response2.Id;
                var backUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response2.BucketId}/files/{backID}/view?project={projectID}";

                // Create new EVBike
                var bike = new EVBike();
                bike.BikeName = eVBikeCreateDTO.BikeName;
                bike.LicensePlate = eVBikeCreateDTO.LicensePlate;
                bike.BrandID = eVBikeCreateDTO.BrandID;
                bike.Color = eVBikeCreateDTO.Color;
                bike.FrontImg = frontUrl;
                bike.BackImg = backUrl;
                bike.Description = eVBikeCreateDTO.Description;
                bike.BatteryCapacity = eVBikeCreateDTO.BatteryCapacity;
                bike.PricePerDay = eVBikeCreateDTO.PricePerDay;

                await _evBikeService.AddAsync(bike);

                var res = new ResponseDTO();
                res.Message = "Thêm xe thành công!";
                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetBikeByID/{id}")]
        [Authorize]
        public async Task<ActionResult<EVBike>> GetBikeByID(int id)
        {
            try
            {
                var bike = await _evBikeService.GetByIdAsync(id);
                if (bike == null)
                {
                    var res = new ResponseDTO();
                    res.Message = "Không tìm thấy xe điện!";
                    return NotFound(res);
                }
                return Ok(bike);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("UpdateBike")]
        [Authorize]
        public async Task<ActionResult> UpdateBike([FromBody] EVBikeUpdateDTO eVBike)
        {
            //Check user permission
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            var res = new ResponseDTO();
            if (permission != "3" && permission != "2")
            {
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            if (!ModelState.IsValid)
            {
                res.Message = ModelState.ToString();
                return BadRequest(res);
            }
            try
            {
                var existingBike = await _evBikeService.GetByIdAsync(eVBike.BikeID);
                if (existingBike == null)
                {
                    res.Message = "Không tìm thấy xe điện!";
                    return NotFound(res);
                }

                //Update bike image
                // Upload images to Appwrite
                var storage = new Storage(_appWriteClient);
                var bucketID = "68dde8b0002f2952237f";
                var projectID = _configuration.GetValue<string>("Appwrite:ProjectId");

                List<string> perms = new List<string>() { Permission.Write(Appwrite.Role.Any()), Permission.Read(Appwrite.Role.Any()) };

                //Upload Bike Front Image
                var frontUID = Guid.NewGuid().ToString();
                var front = InputFile.FromStream(
                    eVBike.FrontImg.OpenReadStream(),
                    eVBike.FrontImg.FileName,
                    eVBike.FrontImg.ContentType
                    );
                var response = await storage.CreateFile(
                            bucketID,
                            frontUID,
                            front,
                            perms,
                            null
                            );

                var frontID = response.Id;
                var frontUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response.BucketId}/files/{frontID}/view?project={projectID}";
                //Upload Bike Back Image
                var backUID = Guid.NewGuid().ToString();
                var back = InputFile.FromStream(
                    eVBike.BackImg.OpenReadStream(),
                    eVBike.BackImg.FileName,
                    eVBike.BackImg.ContentType
                    );
                var response2 = await storage.CreateFile(
                            bucketID,
                            backUID,
                            back,
                            perms,
                            null
                            );
                var backID = response2.Id;
                var backUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response2.BucketId}/files/{backID}/view?project={projectID}";

                // Update bike details
                existingBike.BikeName = eVBike.BikeName;
                existingBike.LicensePlate = eVBike.LicensePlate;
                existingBike.BrandID = eVBike.BrandID;
                existingBike.Color = eVBike.Color;
                existingBike.Description = eVBike.Description;
                existingBike.BatteryCapacity = eVBike.BatteryCapacity;
                existingBike.PricePerDay = eVBike.PricePerDay;
                existingBike.Status = eVBike.Status;
                existingBike.FrontImg = frontUrl;
                existingBike.BackImg = backUrl;

                await _evBikeService.UpdateAsync(existingBike);
                res.Message = "Cập nhật xe thành công!";
                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("UnactivateBike/{id}")]
        [Authorize]
        public async Task<ActionResult> UnactivateBike(int id)
        {
            //Check user permission
            var permission = User.FindFirst(UserClaimTypes.RoleID).Value;
            var res = new ResponseDTO();
            if (permission != "3" && permission != "2")
            {
                res.Message = "Không có quyền truy cập!";
                return Unauthorized(res);
            }
            try
            {
                var existingBike = await _evBikeService.GetByIdAsync(id);
                if (existingBike == null)
                {
                    res.Message = "Không tìm thấy xe điện!";
                    return NotFound(res);
                }

                // Update bike status to Unavailable
                existingBike.Status = 0; // 0: Unavailable

                await _evBikeService.UpdateAsync(existingBike);
                res.Message = "Xe không còn hoạt động!";
                return Ok(res);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}