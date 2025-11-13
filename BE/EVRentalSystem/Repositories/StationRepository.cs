using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class StationRepository : BaseRepository<Station>
    {
        // ? NEW: Constructor for Dependency Injection (RECOMMENDED)
        public StationRepository(EVRenterDBContext context) : base(context)
        {
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