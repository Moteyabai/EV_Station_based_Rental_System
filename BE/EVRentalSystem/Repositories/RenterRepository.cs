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
            var renter = new Renter();
            try
            {
                using (var context = _context)
                {
                    renter = await context.Renters.Include(a => a.Account).SingleOrDefaultAsync(r => r.AccountID == accID);
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }

            return renter;
        }
    }
}