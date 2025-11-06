using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;

namespace Repositories
{
    public class PaymentRepository : BaseRepository<Payment>
    {
        private static PaymentRepository instance;
        private static readonly object instancelock = new object();

        public PaymentRepository() : base()
        {
        }

        public static PaymentRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new PaymentRepository();
                    }
                    return instance;
                }
            }
        }

        public async Task<Payment> GetPaymentByIDAsync(long ID)
        {
            return await _context.Payments
                .FirstOrDefaultAsync(payment => payment.PaymentID == ID);
        }

        public async Task<IEnumerable<Payment>> GetPendingPayment()
        {
            return await _context.Payments
                .Include(payment => payment.Renter)
                .Where(payment => payment.Status == (int)PaymentStatus.Pending)
                .ToListAsync();
        }
    }
}