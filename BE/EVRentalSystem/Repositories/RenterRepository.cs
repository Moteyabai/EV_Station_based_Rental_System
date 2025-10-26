using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;

namespace Repositories
{
    public class RenterRepository : BaseRepository<Renter>
    {
        private static RenterRepository instance;
        private static readonly object instancelock = new object();

        public RenterRepository()
        {
        }

        public static RenterRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new RenterRepository();
                    }
                    return instance;
                }
            }
        }

        public async Task<Renter> GetRenterByAccountIDAsync(int accID)
        {
            try
            {
                var renter = await _context.Renters
                    .Include(a => a.Account)
                    .SingleOrDefaultAsync(r => r.AccountID == accID);

                return renter;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}