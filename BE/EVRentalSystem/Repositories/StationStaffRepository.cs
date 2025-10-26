using BusinessObject.Models;
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
    }
}