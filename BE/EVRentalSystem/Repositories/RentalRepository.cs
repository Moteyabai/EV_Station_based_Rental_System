using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class RentalRepository : BaseRepository<Rental>
    {
        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public RentalRepository(EVRenterDBContext context) : base(context)
        {
        }

        public async Task<Rental?> GetRentalByIDAsync(int rentID)
        {
            return await _context.Rentals
                .Include(r => r.Renter)
                .FirstOrDefaultAsync(rental => rental.RentalID == rentID);
        }

        public async Task<IEnumerable<Rental>> GetRentalsByRenterIDAsync(int renterID)
        {
            return await _context.Rentals
                .Include(r => r.Renter)
                .Where(rental => rental.RenterID == renterID)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rental>> GetRentalsAtStaion(int stationID)
        {
            return await _context.Rentals
                .Include(r => r.Renter)
                .Include(s => s.Station)
                .Where(rental => rental.StationID == stationID)
                .ToListAsync();
        }

        public async Task<IEnumerable<Rental>> GetCompletedAndOngoingRentalAsync()
        {
            return await _context.Rentals
                .Include(r => r.Renter)
                .Where(rental => rental.Status == (int)RentalStatus.Completed || rental.Status == (int)RentalStatus.OnGoing)
                .ToListAsync();
        }
    }
}