using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;

namespace Repositories
{
    public class StationStaffRepository : BaseRepository<StationStaff>
    {
        private static StationStaffRepository instance;
        private static readonly object instancelock = new object();

        public StationStaffRepository()
        {
        }

        public static StationStaffRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new StationStaffRepository();
                    }
                    return instance;
                }
            }
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