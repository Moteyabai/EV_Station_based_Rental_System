using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;

namespace Repositories
{
    public class NotificationRepository : BaseRepository<Notification>
    {
        private static NotificationRepository? instance;
        private static readonly object instancelock = new object();

        public NotificationRepository() : base()
        {
        }

        public static NotificationRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new NotificationRepository();
                    }
                    return instance;
                }
            }
        }

        /// <summary>
        /// Get notifications by account ID with Account navigation property
        /// </summary>
        public async Task<IEnumerable<Notification>> GetNotificationsByAccountIDAsync(int accountId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Include(n => n.Account)
                    .Where(n => n.AccountID == accountId)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return notifications;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting notifications for account {accountId}: {ex.Message}");
            }
        }

        /// <summary>
        /// Get unread notifications by account ID
        /// </summary>
        public async Task<IEnumerable<Notification>> GetUnreadNotificationsByAccountIDAsync(int accountId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Include(n => n.Account)
                    .Where(n => n.AccountID == accountId && !n.IsRead)
                    .OrderByDescending(n => n.CreatedAt)
                    .ToListAsync();

                return notifications;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting unread notifications for account {accountId}: {ex.Message}");
            }
        }

        /// <summary>
        /// Mark notification as read
        /// </summary>
        public async Task<bool> MarkAsReadAsync(int notificationId)
        {
            try
            {
                var notification = await _context.Notifications.FindAsync(notificationId);
                if (notification == null)
                    return false;

                notification.IsRead = true;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error marking notification {notificationId} as read: {ex.Message}");
            }
        }

        /// <summary>
        /// Mark all notifications as read for an account
        /// </summary>
        public async Task<int> MarkAllAsReadAsync(int accountId)
        {
            try
            {
                var notifications = await _context.Notifications
                    .Where(n => n.AccountID == accountId && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();
                return notifications.Count;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error marking all notifications as read for account {accountId}: {ex.Message}");
            }
        }

        /// <summary>
        /// Get notification count by account ID
        /// </summary>
        public async Task<int> GetUnreadCountAsync(int accountId)
        {
            try
            {
                return await _context.Notifications
                    .Where(n => n.AccountID == accountId && !n.IsRead)
                    .CountAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting unread count for account {accountId}: {ex.Message}");
            }
        }

        /// <summary>
        /// Delete old notifications (older than specified days)
        /// </summary>
        public async Task<int> DeleteOldNotificationsAsync(int days)
        {
            try
            {
                var cutoffDate = DateTime.Now.AddDays(-days);
                var oldNotifications = await _context.Notifications
                    .Where(n => n.CreatedAt < cutoffDate && n.IsRead)
                    .ToListAsync();

                _context.Notifications.RemoveRange(oldNotifications);
                await _context.SaveChangesAsync();
                return oldNotifications.Count;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting old notifications: {ex.Message}");
            }
        }
    }
}