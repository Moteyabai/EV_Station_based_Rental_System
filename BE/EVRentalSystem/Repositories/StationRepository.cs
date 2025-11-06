using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;

namespace Repositories
{
    public class StationRepository : BaseRepository<Station>
    {
        private static StationRepository? instance;
        private static readonly object instancelock = new object();

        public StationRepository() : base()
        {
        }

        public static StationRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new StationRepository();
                    }
                    return instance;
                }
            }
        }
        //Get activity stations
        public async Task<IEnumerable<Station>> GetActiveStationsAsync()
        {
            return await _context.Stations
                .Where(station => station.IsActive)
                .ToListAsync();
        }
    }
}