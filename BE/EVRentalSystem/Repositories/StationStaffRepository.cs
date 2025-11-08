using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class StationStaffRepository : BaseRepository<StationStaff>
    {
        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public StationStaffRepository(EVRenterDBContext context) : base(context)
        {
        }

        public async Task<StationStaff> GetStaffByAccountID(int accountID)
        {
            try
            {
                var staff = await _context.StationStaffs.FirstOrDefaultAsync(s => s.AccountID == accountID);
                return staff;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}