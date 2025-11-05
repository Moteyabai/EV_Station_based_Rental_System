using Appwrite;
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
    public class StationController : ControllerBase
    {
        private readonly StationService _stationService;
        private readonly EVBike_StocksService _eVBike_StocksService;
        private readonly Client _appWriteClient;
        private readonly IConfiguration _configuration;
        private readonly EVBike_StocksService _eVBikeStocksService;

        public StationController(StationService stationService, IConfiguration configuration,
            EVBike_StocksService eVBike_StocksService, EVBike_StocksService eVBikeStocksService)
        {
            _stationService = stationService;
            _eVBike_StocksService = eVBike_StocksService;
            _configuration = configuration;
            _eVBikeStocksService = eVBikeStocksService;
            AppwriteSettings appW = new AppwriteSettings()
            {
                ProjectId = configuration.GetValue<string>("Appwrite:ProjectId"),
                Endpoint = configuration.GetValue<string>("Appwrite:Endpoint"),
                ApiKey = configuration.GetValue<string>("Appwrite:ApiKey")
            };
            _appWriteClient = new Client().SetProject(appW.ProjectId).SetEndpoint(appW.Endpoint).SetKey(appW.ApiKey);
        }

        /// <summary>
        /// Get all stations
        /// </summary>
        [HttpGet("GetAllStations")]
        public async Task<ActionResult<IEnumerable<Station>>> GetAllStations()
        {
            try
            {
                var stations = await _stationService.GetAllAsync();
                if (stations == null || !stations.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh sách trạm trống"
                    };
                    return NotFound(res);
                }
                return Ok(stations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get active stations only
        /// </summary>
        [HttpGet("GetActiveStations")]
        public async Task<ActionResult<IEnumerable<StationDisplayDTO>>> GetActiveStations()
        {
            try
            {
                var stations = await _stationService.GetActiveStationsAsync();
                if (stations == null || !stations.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không có trạm nào đang hoạt động"
                    };
                    return NotFound(res);
                }
                
                var display = new List<StationDisplayDTO>();
                foreach (var station in stations) { 
                    var quantity = await _eVBikeStocksService.GetStockCountByStationIDAsync(station.StationID);
                    var dis = new StationDisplayDTO
                    {
                        StationID = station.StationID,
                        Name = station.Name,
                        Address = station.Address,
                        Description = station.Description,
                        BikeCapacity = quantity,
                        OpeningHours = station.OpeningHours,
                        ContactNumber = station.ContactNumber,
                        ImageUrl = station.ImageUrl,
                        ExteriorImageUrl = station.ExteriorImageUrl,
                        ThumbnailImageUrl = station.ThumbnailImageUrl,
                        IsActive = station.IsActive,
                        CreatedAt = station.CreatedAt,
                        UpdatedAt = station.UpdatedAt
                    };
                    display.Add(dis);
                }
                return Ok(display);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("AvailableStockInStationsByBikeID")]
        public async Task<ActionResult<IEnumerable<StationDisplayDTO>>> AvailableStockInStationsByBikeID(int bikeID)
        {
            try
            {
                var stocks = await _eVBike_StocksService.GetAvailbStocksAtStationByBikeIDAsync(bikeID);
                if (stocks == null || !stocks.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Loại xe này không còn hàng"
                    };
                    return NotFound(res);
                }

                var stastions = new List<Station>();
                foreach (var stock in stocks)
                {
                    if (stock.Station != null && !stastions.Any(s => s.StationID == stock.Station.StationID))
                    {
                        stastions.Add(stock.Station);
                    }
                }

                var display = new List<StationDisplayDTO>();
                foreach (var station in stastions)
                {
                    var quantity = await _eVBikeStocksService.GetStockCountByStationIDAsync(station.StationID);
                    var dis = new StationDisplayDTO
                    {
                        StationID = station.StationID,
                        Name = station.Name,
                        Address = station.Address,
                        Description = station.Description,
                        BikeCapacity = quantity,
                        OpeningHours = station.OpeningHours,
                        ContactNumber = station.ContactNumber,
                        ImageUrl = station.ImageUrl,
                        ExteriorImageUrl = station.ExteriorImageUrl,
                        ThumbnailImageUrl = station.ThumbnailImageUrl,
                        IsActive = station.IsActive,
                        CreatedAt = station.CreatedAt,
                        UpdatedAt = station.UpdatedAt
                    };
                    display.Add(dis);
                }
                return Ok(display);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get station by ID
        /// </summary>
        [HttpGet("GetStationById/{id}")]
        public async Task<ActionResult<StationDisplayDTO>> GetStationById(int id)
        {
            try
            {
                var station = await _stationService.GetByIdAsync(id);
                if (station == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin trạm!"
                    };
                    return NotFound(res);
                }

                var display = new StationDisplayDTO
                {
                    StationID = station.StationID,
                    Name = station.Name,
                    Address = station.Address,
                    Description = station.Description,
                    BikeCapacity = await _eVBikeStocksService.GetStockCountByStationIDAsync(station.StationID),
                    OpeningHours = station.OpeningHours,
                    ContactNumber = station.ContactNumber,
                    ImageUrl = station.ImageUrl,
                    ExteriorImageUrl = station.ExteriorImageUrl,
                    ThumbnailImageUrl = station.ThumbnailImageUrl,
                    IsActive = station.IsActive,
                    CreatedAt = station.CreatedAt,
                    UpdatedAt = station.UpdatedAt
                };

                return Ok(display);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("CreateStation")]
        [Authorize]
        public async Task<ActionResult> CreateStation([FromBody] StationCreateDTO stationDto)
        {
            // Check user permission (only admin can create stations)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
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
                // Check if station name already exists
                var existingStation = await _stationService.GetStationByNameAsync(stationDto.Name);
                if (existingStation != null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Tên trạm đã tồn tại!"
                    };
                    return BadRequest(res);
                }

                var storage = new Storage(_appWriteClient);
                var bucketID = _configuration.GetValue<string>("Appwrite:BucketId");
                var projectID = _configuration.GetValue<string>("Appwrite:ProjectId");

                List<string> perms = new List<string>() { Permission.Write(Appwrite.Role.Any()), Permission.Read(Appwrite.Role.Any()) };

                //Upload image
                var imageUID = Guid.NewGuid().ToString();
                var image = InputFile.FromStream(
                    stationDto.ImageUrl.OpenReadStream(),
                    stationDto.ImageUrl.FileName,
                    stationDto.ImageUrl.ContentType
                    );
                var response = await storage.CreateFile(
                            bucketID,
                            imageUID,
                            image,
                            perms,
                            null
                            );

                var imageID = response.Id;
                var imageUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response.BucketId}/files/{imageID}/view?project={projectID}";

                //Upload exterior image

                var exteriorImageUID = Guid.NewGuid().ToString();
                var exteriorImage = InputFile.FromStream(
                    stationDto.ExteriorImageUrl.OpenReadStream(),
                    stationDto.ExteriorImageUrl.FileName,
                    stationDto.ExteriorImageUrl.ContentType
                    );
                var exteriorResponse = await storage.CreateFile(
                            bucketID,
                            exteriorImageUID,
                            exteriorImage,
                            perms,
                            null
                            );
                var exteriorImageID = exteriorResponse.Id;
                var exteriorImageUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{exteriorResponse.BucketId}/files/{exteriorImageID}/view?project={projectID}";

                //Upload thumbnail image
                var thumbnailImageUID = Guid.NewGuid().ToString();
                var thumbnailImage = InputFile.FromStream(
                    stationDto.ThumbnailImageUrl.OpenReadStream(),
                    stationDto.ThumbnailImageUrl.FileName,
                    stationDto.ThumbnailImageUrl.ContentType
                    );
                var thumbnailResponse = await storage.CreateFile(
                            bucketID,
                            thumbnailImageUID,
                            thumbnailImage,
                            perms,
                            null
                            );
                var thumbnailImageID = thumbnailResponse.Id;
                var thumbnailImageUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{thumbnailResponse.BucketId}/files/{thumbnailImageID}/view?project={projectID}";

                // Create new station
                var station = new Station
                {
                    Name = stationDto.Name,
                    Address = stationDto.Address,
                    Description = stationDto.Description,
                    OpeningHours = stationDto.OpeningHours,
                    ContactNumber = stationDto.ContactNumber,
                    ImageUrl = imageUrl,
                    ExteriorImageUrl = exteriorImageUrl,
                    ThumbnailImageUrl = thumbnailImageUrl,
                    IsActive = stationDto.IsActive,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                await _stationService.AddAsync(station);

                var successRes = new ResponseDTO
                {
                    Message = "Tạo trạm thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("UpdateStation")]
        [Authorize]
        public async Task<ActionResult> UpdateStation([FromBody] StationUpdateDTO stationDto)
        {
            // Check user permission (only admin can update stations)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
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
                var existingStation = await _stationService.GetByIdAsync(stationDto.StationID);
                if (existingStation == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin trạm!"
                    };
                    return NotFound(res);
                }

                // Check if new name conflicts with existing station (if name is being changed)
                if (!string.IsNullOrEmpty(stationDto.Name) && stationDto.Name != existingStation.Name)
                {
                    var nameConflict = await _stationService.GetStationByNameAsync(stationDto.Name);
                    if (nameConflict != null)
                    {
                        var res = new ResponseDTO
                        {
                            Message = "Tên trạm đã tồn tại!"
                        };
                        return BadRequest(res);
                    }
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(stationDto.Name))
                    existingStation.Name = stationDto.Name;
                if (!string.IsNullOrEmpty(stationDto.Address))
                    existingStation.Address = stationDto.Address;
                if (!string.IsNullOrEmpty(stationDto.Description))
                    existingStation.Description = stationDto.Description;
                if (!string.IsNullOrEmpty(stationDto.OpeningHours))
                    existingStation.OpeningHours = stationDto.OpeningHours;
                if (!string.IsNullOrEmpty(stationDto.ContactNumber))
                    existingStation.ContactNumber = stationDto.ContactNumber;
                if (!string.IsNullOrEmpty(stationDto.ImageUrl))
                    existingStation.ImageUrl = stationDto.ImageUrl;
                if (!string.IsNullOrEmpty(stationDto.ExteriorImageUrl))
                    existingStation.ExteriorImageUrl = stationDto.ExteriorImageUrl;
                if (!string.IsNullOrEmpty(stationDto.ThumbnailImageUrl))
                    existingStation.ThumbnailImageUrl = stationDto.ThumbnailImageUrl;
                if (stationDto.IsActive.HasValue)
                    existingStation.IsActive = stationDto.IsActive.Value;

                existingStation.UpdatedAt = DateTime.Now;

                await _stationService.UpdateAsync(existingStation);

                var successRes = new ResponseDTO
                {
                    Message = "Cập nhật thông tin trạm thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("DeleteStation/{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteStation(int id)
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
                var station = await _stationService.GetByIdAsync(id);
                if (station == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Không tìm thấy thông tin trạm!"
                    };
                    return NotFound(res);
                }

                await _stationService.DeleteAsync(id);

                var successRes = new ResponseDTO
                {
                    Message = "Xóa trạm thành công!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetInactiveStations")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Station>>> GetInactiveStations()
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
                var stations = await _stationService.GetInactiveStationsAsync();
                return Ok(stations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("SearchStations")]
        public async Task<ActionResult<IEnumerable<Station>>> SearchStations([FromBody] StationSearchDTO searchDto)
        {
            try
            {
                var stations = await _stationService.GetAllAsync();

                // Apply filters
                if (!string.IsNullOrEmpty(searchDto.Name))
                {
                    stations = stations.Where(s => s.Name.Contains(searchDto.Name, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrEmpty(searchDto.Address))
                {
                    stations = stations.Where(s => s.Address.Contains(searchDto.Address, StringComparison.OrdinalIgnoreCase));
                }

                if (searchDto.IsActive.HasValue)
                {
                    stations = stations.Where(s => s.IsActive == searchDto.IsActive.Value);
                }

                if (searchDto.CreatedAfter.HasValue)
                {
                    stations = stations.Where(s => s.CreatedAt >= searchDto.CreatedAfter.Value);
                }

                if (searchDto.CreatedBefore.HasValue)
                {
                    stations = stations.Where(s => s.CreatedAt <= searchDto.CreatedBefore.Value);
                }

                if (!string.IsNullOrEmpty(searchDto.OpeningHours))
                {
                    stations = stations.Where(s => s.OpeningHours.Contains(searchDto.OpeningHours, StringComparison.OrdinalIgnoreCase));
                }

                return Ok(stations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("GetStationsWithAvailableBikes")]
        public async Task<ActionResult<IEnumerable<Station>>> GetStationsWithAvailableBikes()
        {
            try
            {
                var stations = await _stationService.GetStationsWithAvailableBikesAsync();
                return Ok(stations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}