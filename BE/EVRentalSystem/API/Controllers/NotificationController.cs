using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.JWT;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;
using System.ComponentModel.DataAnnotations;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly AccountService _accountService;

        public NotificationController(NotificationService notificationService, AccountService accountService)
        {
            _notificationService = notificationService;
            _accountService = accountService;
        }

        /// <summary>
        /// Get all notifications (Admin only)
        /// </summary>
        [HttpGet("GetAllNotifications")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> GetAllNotifications()
        {
            // Check user permission (Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Kh�ng c� quy?n truy c?p!"
                };
                return Unauthorized(res);
            }

            try
            {
                var notifications = await _notificationService.GetAllAsync();
                if (notifications == null || !notifications.Any())
                {
                    var res = new ResponseDTO
                    {
                        Message = "Danh s�ch th�ng b�o tr?ng"
                    };
                    return NotFound(res);
                }
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get notification by ID
        /// </summary>
        [HttpGet("GetNotificationById/{id}")]
        [Authorize]
        public async Task<ActionResult<Notification>> GetNotificationById(int id)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                var notification = await _notificationService.GetByIdAsync(id);
                if (notification == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng t�m th?y th�ng b�o!"
                    };
                    return NotFound(res);
                }

                // Allow: Admin or user viewing their own notification
                if (permission != "3" && notification.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng c� quy?n truy c?p!"
                    };
                    return Unauthorized(res);
                }

                return Ok(notification);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get notifications by account ID (User can view own, Admin can view all)
        /// </summary>
        [HttpGet("GetMyNotifications")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> GetMyNotifications()
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                if (string.IsNullOrEmpty(userAccountId))
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng t�m th?y th�ng tin t�i kho?n!"
                    };
                    return Unauthorized(res);
                }

                var notifications = await _notificationService.GetNotificationsByAccountIDAsync(int.Parse(userAccountId));
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get notifications by account ID (Admin only)
        /// </summary>
        [HttpGet("GetNotificationsByAccount/{accountId}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> GetNotificationsByAccount(int accountId)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            // Allow: Admin or user viewing their own notifications
            if (permission != "3" && accountId.ToString() != userAccountId)
            {
                var res = new ResponseDTO
                {
                    Message = "Kh�ng c� quy?n truy c?p!"
                };
                return Unauthorized(res);
            }

            try
            {
                var notifications = await _notificationService.GetNotificationsByAccountIDAsync(accountId);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get unread notifications for current user
        /// </summary>
        [HttpGet("GetUnreadNotifications")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> GetUnreadNotifications()
        {
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                if (string.IsNullOrEmpty(userAccountId))
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng t�m th?y th�ng tin t�i kho?n!"
                    };
                    return Unauthorized(res);
                }

                var notifications = await _notificationService.GetUnreadNotificationsByAccountIDAsync(int.Parse(userAccountId));
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get unread notification count for current user
        /// </summary>
        [HttpGet("GetUnreadCount")]
        [Authorize]
        public async Task<ActionResult<int>> GetUnreadCount()
        {
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                if (string.IsNullOrEmpty(userAccountId))
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng t�m th?y th�ng tin t�i kho?n!"
                    };
                    return Unauthorized(res);
                }

                var count = await _notificationService.GetUnreadCountAsync(int.Parse(userAccountId));
                return Ok(new { unreadCount = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Create new notification (Admin only)
        /// </summary>
        [HttpPost("CreateNotification")]
        [Authorize]
        public async Task<ActionResult> CreateNotification([FromBody] NotificationCreateDTO notificationDto)
        {
            // Check user permission (Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Kh�ng c� quy?n truy c?p!"
                };
                return Unauthorized(res);
            }

            if (!ModelState.IsValid)
            {
                var res = new ResponseDTO
                {
                    Message = "D? li?u kh�ng h?p l?!"
                };
                return BadRequest(res);
            }

            try
            {
                // Check if account exists
                var account = await _accountService.GetByIdAsync(notificationDto.AccountID);
                if (account == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "T�i kho?n kh�ng t?n t?i!"
                    };
                    return NotFound(res);
                }

                var notification = new Notification
                {
                    AccountID = notificationDto.AccountID,
                    Message = notificationDto.Message,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                await _notificationService.AddAsync(notification);

                var successRes = new ResponseDTO
                {
                    Message = "T?o th�ng b�o th�nh c�ng!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Create bulk notifications (Admin only)
        /// </summary>
        [HttpPost("CreateBulkNotifications")]
        [Authorize]
        public async Task<ActionResult> CreateBulkNotifications([FromBody] BulkNotificationCreateDTO bulkDto)
        {
            // Check user permission (Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Kh�ng c� quy?n truy c?p!"
                };
                return Unauthorized(res);
            }

            if (!ModelState.IsValid)
            {
                var res = new ResponseDTO
                {
                    Message = "D? li?u kh�ng h?p l?!"
                };
                return BadRequest(res);
            }

            try
            {
                await _notificationService.CreateBulkNotificationsAsync(bulkDto.AccountIDs, bulkDto.Message);

                var successRes = new ResponseDTO
                {
                    Message = $"?� g?i th�ng b�o ??n {bulkDto.AccountIDs.Count} ng??i d�ng!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Update notification (Admin only)
        /// </summary>
        [HttpPut("UpdateNotification")]
        [Authorize]
        public async Task<ActionResult> UpdateNotification([FromBody] NotificationUpdateDTO notificationDto)
        {
            // Check user permission (Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Kh�ng c� quy?n truy c?p!"
                };
                return Unauthorized(res);
            }

            if (!ModelState.IsValid)
            {
                var res = new ResponseDTO
                {
                    Message = "D? li?u kh�ng h?p l?!"
                };
                return BadRequest(res);
            }

            try
            {
                var existingNotification = await _notificationService.GetByIdAsync(notificationDto.NotificationID);
                if (existingNotification == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng t�m th?y th�ng b�o!"
                    };
                    return NotFound(res);
                }

                // Update only provided fields
                if (!string.IsNullOrEmpty(notificationDto.Message))
                    existingNotification.Message = notificationDto.Message;
                if (notificationDto.IsRead.HasValue)
                    existingNotification.IsRead = notificationDto.IsRead.Value;

                await _notificationService.UpdateAsync(existingNotification);

                var successRes = new ResponseDTO
                {
                    Message = "C?p nh?t th�ng b�o th�nh c�ng!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Mark notification as read (User can mark own, Admin can mark all)
        /// </summary>
        [HttpPut("MarkAsRead/{id}")]
        [Authorize]
        public async Task<ActionResult> MarkAsRead(int id)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                var notification = await _notificationService.GetByIdAsync(id);
                if (notification == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng t�m th?y th�ng b�o!"
                    };
                    return NotFound(res);
                }

                // Allow: Admin or user marking their own notification
                if (permission != "3" && notification.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng c� quy?n truy c?p!"
                    };
                    return Unauthorized(res);
                }

                var success = await _notificationService.MarkAsReadAsync(id);
                if (!success)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng th? ?�nh d?u ?� ??c!"
                    };
                    return BadRequest(res);
                }

                var successRes = new ResponseDTO
                {
                    Message = "?� ?�nh d?u th�ng b�o l� ?� ??c!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Mark all notifications as read for current user
        /// </summary>
        [HttpPut("MarkAllAsRead")]
        [Authorize]
        public async Task<ActionResult> MarkAllAsRead()
        {
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                if (string.IsNullOrEmpty(userAccountId))
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng t�m th?y th�ng tin t�i kho?n!"
                    };
                    return Unauthorized(res);
                }

                var count = await _notificationService.MarkAllAsReadAsync(int.Parse(userAccountId));

                var successRes = new ResponseDTO
                {
                    Message = $"?� ?�nh d?u {count} th�ng b�o l� ?� ??c!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete notification (Admin or owner)
        /// </summary>
        [HttpDelete("DeleteNotification/{id}")]
        [Authorize]
        public async Task<ActionResult> DeleteNotification(int id)
        {
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            var userAccountId = User.FindFirst(UserClaimTypes.AccountID)?.Value;

            try
            {
                var notification = await _notificationService.GetByIdAsync(id);
                if (notification == null)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng t�m th?y th�ng b�o!"
                    };
                    return NotFound(res);
                }

                // Allow: Admin or user deleting their own notification
                if (permission != "3" && notification.AccountID.ToString() != userAccountId)
                {
                    var res = new ResponseDTO
                    {
                        Message = "Kh�ng c� quy?n truy c?p!"
                    };
                    return Unauthorized(res);
                }

                await _notificationService.DeleteAsync(id);

                var successRes = new ResponseDTO
                {
                    Message = "X�a th�ng b�o th�nh c�ng!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete old notifications (Admin only)
        /// </summary>
        [HttpDelete("DeleteOldNotifications/{days}")]
        [Authorize]
        public async Task<ActionResult> DeleteOldNotifications(int days)
        {
            // Check user permission (Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Kh�ng c� quy?n truy c?p!"
                };
                return Unauthorized(res);
            }

            try
            {
                var count = await _notificationService.DeleteOldNotificationsAsync(days);

                var successRes = new ResponseDTO
                {
                    Message = $"?� x�a {count} th�ng b�o c? h?n {days} ng�y!"
                };
                return Ok(successRes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Get notification statistics (Admin only)
        /// </summary>
        [HttpGet("GetStatistics")]
        [Authorize]
        public async Task<ActionResult<NotificationStatisticsDTO>> GetStatistics()
        {
            // Check user permission (Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Kh�ng c� quy?n truy c?p!"
                };
                return Unauthorized(res);
            }

            try
            {
                var notifications = (await _notificationService.GetAllAsync()).ToList();

                var statistics = new NotificationStatisticsDTO
                {
                    TotalNotifications = notifications.Count,
                    UnreadNotifications = notifications.Count(n => !n.IsRead),
                    ReadNotifications = notifications.Count(n => n.IsRead),
                    ReadRate = notifications.Count > 0 ? (double)notifications.Count(n => n.IsRead) / notifications.Count * 100 : 0,
                    LatestNotificationDate = notifications.Count > 0 ? notifications.Max(n => n.CreatedAt) : null
                };

                // Notifications by account
                statistics.NotificationsByAccount = notifications
                    .GroupBy(n => n.AccountID)
                    .ToDictionary(g => g.Key, g => g.Count());

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Search notifications with filters (Admin only)
        /// </summary>
        [HttpPost("SearchNotifications")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Notification>>> SearchNotifications([FromBody] NotificationSearchDTO searchDto)
        {
            // Check user permission (Admin only)
            var permission = User.FindFirst(UserClaimTypes.RoleID)?.Value;
            if (permission != "3")
            {
                var res = new ResponseDTO
                {
                    Message = "Kh�ng c� quy?n truy c?p!"
                };
                return Unauthorized(res);
            }

            try
            {
                var notifications = await _notificationService.GetAllAsync();

                // Apply filters
                if (searchDto.AccountID.HasValue)
                {
                    notifications = notifications.Where(n => n.AccountID == searchDto.AccountID.Value);
                }

                if (searchDto.IsRead.HasValue)
                {
                    notifications = notifications.Where(n => n.IsRead == searchDto.IsRead.Value);
                }

                if (searchDto.StartDate.HasValue)
                {
                    notifications = notifications.Where(n => n.CreatedAt >= searchDto.StartDate.Value);
                }

                if (searchDto.EndDate.HasValue)
                {
                    notifications = notifications.Where(n => n.CreatedAt <= searchDto.EndDate.Value);
                }

                return Ok(notifications.OrderByDescending(n => n.CreatedAt));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// DTO for bulk notification creation
    /// </summary>
    public class BulkNotificationCreateDTO
    {
        [Required(ErrorMessage = "Danh s�ch t�i kho?n l� b?t bu?c")]
        public List<int> AccountIDs { get; set; } = new();

        [Required(ErrorMessage = "N?i dung th�ng b�o l� b?t bu?c")]
        [StringLength(1000, ErrorMessage = "N?i dung th�ng b�o kh�ng ???c qu� 1000 k� t?")]
        public string Message { get; set; } = string.Empty;
    }
}
