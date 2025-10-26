using BusinessObject.Models;
using Repositories;
using Services.Interfaces;

namespace Services
{
    public class NotificationService : IBaseService<Notification>
    {
        private readonly NotificationRepository _notificationRepository;

        public NotificationService()
        {
            _notificationRepository = NotificationRepository.Instance;
        }

        public async Task AddAsync(Notification entity) => await _notificationRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _notificationRepository.DeleteAsync(id);

        public async Task<IEnumerable<Notification>> GetAllAsync() => await _notificationRepository.GetAllAsync();

        public async Task<Notification> GetByIdAsync(int id) => await _notificationRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Notification entity) => await _notificationRepository.UpdateAsync(entity);

        public async Task<IEnumerable<Notification>> GetNotificationsByAccountIDAsync(int accountId) => await _notificationRepository.GetNotificationsByAccountIDAsync(accountId);

        public async Task<IEnumerable<Notification>> GetUnreadNotificationsByAccountIDAsync(int accountId) => await _notificationRepository.GetUnreadNotificationsByAccountIDAsync(accountId);

        public async Task<bool> MarkAsReadAsync(int notificationId) => await _notificationRepository.MarkAsReadAsync(notificationId);

        public async Task<int> MarkAllAsReadAsync(int accountId)
        {
            return await _notificationRepository.MarkAllAsReadAsync(accountId);
        }

        public async Task<int> GetUnreadCountAsync(int accountId)
        {
            return await _notificationRepository.GetUnreadCountAsync(accountId);
        }

        public async Task<int> DeleteOldNotificationsAsync(int days)
        {
            return await _notificationRepository.DeleteOldNotificationsAsync(days);
        }

        /// <summary>
        /// Create a notification for a specific account
        /// </summary>
        public async Task<Notification> CreateNotificationAsync(int accountId, string message)
        {
            var notification = new Notification
            {
                AccountID = accountId,
                Message = message,
                IsRead = false,
                CreatedAt = DateTime.Now
            };

            await AddAsync(notification);
            return notification;
        }

        /// <summary>
        /// Create notifications for multiple accounts
        /// </summary>
        public async Task CreateBulkNotificationsAsync(List<int> accountIds, string message)
        {
            foreach (var accountId in accountIds)
            {
                var notification = new Notification
                {
                    AccountID = accountId,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.Now
                };

                await AddAsync(notification);
            }
        }
    }
}
