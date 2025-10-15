using BusinessObject.Models;
using Repositories;
using Services.Interfaces;

namespace Services
{
    public class PaymentService : IBaseService<Payment>
    {
        private readonly PaymentRepository _paymentRepository;

        public PaymentService()
        {
            _paymentRepository = PaymentRepository.Instance;
        }

        public async Task AddAsync(Payment entity) => await _paymentRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _paymentRepository.DeleteAsync(id);

        public async Task<IEnumerable<Payment>> GetAllAsync() => await _paymentRepository.GetAllAsync();

        public async Task<Payment> GetByIdAsync(int id) => await _paymentRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Payment entity) => await _paymentRepository.UpdateAsync(entity);

        // Additional business methods for Payment
        public async Task<IEnumerable<Payment>> GetPaymentsByRenterAsync(int renterId)
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.RenterID == renterId);
        }

        public async Task<IEnumerable<Payment>> GetPaymentsByRentalAsync(int rentalId)
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.RentalID == rentalId);
        }

        public async Task<IEnumerable<Payment>> GetPaymentsByMethodAsync(int paymentMethod)
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.PaymentMethod == paymentMethod);
        }

        public async Task<IEnumerable<Payment>> GetPaymentsByTypeAsync(int paymentType)
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.PaymentType == paymentType);
        }

        public async Task<IEnumerable<Payment>> GetPaymentsByStatusAsync(int status)
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.Status == status);
        }

        public async Task<IEnumerable<Payment>> GetPendingPaymentsAsync()
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.Status == 0); // 0: Pending
        }

        public async Task<IEnumerable<Payment>> GetCompletedPaymentsAsync()
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.Status == 1); // 1: Completed
        }

        public async Task<IEnumerable<Payment>> GetFailedPaymentsAsync()
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.Status == -1); // -1: Failed
        }

        public async Task<IEnumerable<Payment>> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var payments = await GetAllAsync();
            return payments.Where(p => p.CreatedAt >= startDate && p.CreatedAt <= endDate);
        }

        public async Task<decimal> GetTotalAmountByRenterAsync(int renterId)
        {
            var payments = await GetPaymentsByRenterAsync(renterId);
            return payments.Where(p => p.Status == 1).Sum(p => p.Amount); // Only completed payments
        }

        public async Task<decimal> GetTotalAmountByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var payments = await GetPaymentsByDateRangeAsync(startDate, endDate);
            return payments.Where(p => p.Status == 1).Sum(p => p.Amount); // Only completed payments
        }
    }
}