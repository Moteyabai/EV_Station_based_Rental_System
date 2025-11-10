using BusinessObject.Models;
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
    }
}