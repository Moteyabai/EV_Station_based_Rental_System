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
        /// Convert local file path to public URL
        /// </summary>
        private string? ConvertToPublicUrl(string? imagePath)
        {
            // If null or empty, return null
            if (string.IsNullOrWhiteSpace(imagePath))
                return null;

            // If already a valid HTTP/HTTPS URL, return as-is
            if (imagePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                imagePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                return imagePath;
            }

            // If it's a local file path (C:\, /uploads/, etc.), convert to API endpoint
            if (imagePath.Contains(":\\") || imagePath.StartsWith("/uploads/") || imagePath.StartsWith("uploads/"))
            {
                // Extract filename from path
                string fileName = Path.GetFileName(imagePath);

                // Get base URL from configuration or use default
                var baseUrl = _configuration.GetValue<string>("ApiBaseUrl") ?? "http://localhost:5168";

                // Return API endpoint URL
                return $"{baseUrl}/api/Station/images/{fileName}";
            }

            // If it's just a filename, convert to API endpoint
            if (!imagePath.Contains("/") && !imagePath.Contains("\\"))
            {
                var baseUrl = _configuration.GetValue<string>("ApiBaseUrl") ?? "http://localhost:5168";
                return $"{baseUrl}/api/Station/images/{imagePath}";
            }

            // Default: return original if we can't determine the format
            return imagePath;
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
                foreach (var station in stations)
                {
                    var quantity = await _eVBikeStocksService.GetStockCountByStationIDAsync(station.StationID);

                    // Convert local path to URL endpoint if needed
                    string? imageUrl = ConvertToPublicUrl(station.ImageUrl);
                    string? exteriorUrl = ConvertToPublicUrl(station.ExteriorImageUrl);
                    string? thumbnailUrl = ConvertToPublicUrl(station.ThumbnailImageUrl);

                    var dis = new StationDisplayDTO
                    {
                        StationID = station.StationID,
                        Name = station.Name,
                        Address = station.Address,
                        Description = station.Description,
                        BikeCapacity = quantity,
                        OpeningHours = station.OpeningHours,
                        ContactNumber = station.ContactNumber,
                        ImageUrl = imageUrl,
                        ExteriorImageUrl = exteriorUrl,
                        ThumbnailImageUrl = thumbnailUrl,
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
        /// Serve station image from local storage (if needed)
        /// </summary>
        /// <param name="fileName">Image file name (e.g., "station-1-abc123.jpg")</param>
        [HttpGet("images/{fileName}")]
        public IActionResult GetStationImage(string fileName)
        {
            try
            {
                // Validate filename to prevent directory traversal attacks
                if (string.IsNullOrWhiteSpace(fileName) ||
                    fileName.Contains("..") ||
                    fileName.Contains("/") ||
                    fileName.Contains("\\"))
                {
                    return BadRequest(new ResponseDTO { Message = "Tên file không hợp lệ" });
                }

                // Construct file path (adjust path as needed)
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "stations");
                var filePath = Path.Combine(uploadsFolder, fileName);

                // Check if file exists
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new ResponseDTO { Message = "Không tìm thấy hình ảnh" });
                }

                // Determine content type based on file extension
                var extension = Path.GetExtension(fileName).ToLowerInvariant();
                var contentType = extension switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".webp" => "image/webp",
                    _ => "application/octet-stream"
                };

                // Read and return file
                var imageBytes = System.IO.File.ReadAllBytes(filePath);
                return File(imageBytes, contentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDTO { Message = $"Lỗi khi tải hình ảnh: {ex.Message}" });
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
                // Use Appwrite CDN URL for better performance
                var imageUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response.BucketId}/files/{imageID}/view?project={projectID}";

                Console.WriteLine($"[STATION] Uploaded image URL: {imageUrl}"); // Debug log

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
                if (stationDto.IsActive.HasValue)
                    existingStation.IsActive = stationDto.IsActive.Value;

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
                // Use Appwrite CDN URL for better performance
                var imageUrl = $"{_appWriteClient.Endpoint}/storage/buckets/{response.BucketId}/files/{imageID}/view?project={projectID}";

                Console.WriteLine($"[STATION] Uploaded image URL: {imageUrl}"); // Debug log

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


                existingStation.UpdatedAt = DateTime.Now;
                existingStation.ImageUrl = stationDto.ImageUrl != null ? imageUrl : existingStation.ImageUrl;
                existingStation.ExteriorImageUrl = stationDto.ExteriorImageUrl != null ? exteriorImageUrl : existingStation.ExteriorImageUrl;
                existingStation.ThumbnailImageUrl = stationDto.ThumbnailImageUrl != null ? thumbnailImageUrl : existingStation.ThumbnailImageUrl;
                existingStation.OpeningHours = stationDto.OpeningHours ?? existingStation.OpeningHours;
                existingStation.Address = stationDto.Address ?? existingStation.Address;
                existingStation.Description = stationDto.Description ?? existingStation.Description;


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