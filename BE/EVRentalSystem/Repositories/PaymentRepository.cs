using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class PaymentRepository : BaseRepository<Payment>
    {
        // ? NEW: Constructor for Dependency Injection (RECOMMENDED)
        public PaymentRepository(EVRenterDBContext context) : base(context)
        {
        }

        public async Task<Payment> GetPaymentByIDAsync(long ID)
        {
            return await _context.Payments
                .Include(r => r.Rental)
                .FirstOrDefaultAsync(payment => payment.PaymentID == ID);
        }

        public async Task<IEnumerable<Payment>> GetPendingPayment()
        {
            return await _context.Payments
                .Include(payment => payment.Renter)
                .Where(payment => payment.Status == (int)PaymentStatus.Pending && payment.PaymentMethod==(int)PaymentMethod.Cash)
                .ToListAsync();
        }

        public async Task<Payment> GetDepositPaymentByRentalIDAsync(int rentalID)
        {
            return await _context.Payments
                .FirstOrDefaultAsync(payment => payment.RentalID == rentalID && payment.PaymentType == (int)PaymentType.Deposit);
        }

        public async Task<Payment?> GetPayOSPaymentAtStationAsync(int stationID)
        {
            return await _context.Payments
                .Include(payment => payment.Rental)
                .FirstOrDefaultAsync(payment => payment.Rental.StationID == stationID && payment.PaymentMethod == (int)PaymentMethod.PayOS);
        }
        public async Task<Payment?> GetCashPaymentAtStationAsync(int stationID)
        {
            return await _context.Payments
                .Include(payment => payment.Rental)
                .FirstOrDefaultAsync(payment => payment.Rental.StationID == stationID && payment.PaymentMethod == (int)PaymentMethod.Cash);
        }
    }
}