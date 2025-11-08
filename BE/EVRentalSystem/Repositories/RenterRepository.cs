using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class RenterRepository : BaseRepository<Renter>
    {
        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public RenterRepository(EVRenterDBContext context) : base(context)
        {
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

        public async Task<Renter> GetRenterByDocumentID(int documentID)
        {
            try
            {
                var renter = await _context.Renters
                    .Include(a => a.Account)
                    .SingleOrDefaultAsync(r => r.DocumentID == documentID);
                return renter;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}