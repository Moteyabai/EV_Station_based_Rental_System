using BusinessObject.Models;
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
    }
}