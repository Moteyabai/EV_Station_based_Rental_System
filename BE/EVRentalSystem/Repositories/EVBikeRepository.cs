using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class EVBikeRepository : BaseRepository<EVBike>
    {
        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public EVBikeRepository(EVRenterDBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<EVBike>> GetAvailableBikesAsync()
        {
            try
            {
                return await _context.EVBikes
                    .AsNoTracking()  // ✅ Read-only, no tracking needed
                    .Include(x => x.Brand)
                    .Where(bike => bike.Status == (int)BikeStatus.Available)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        /// <summary>
        /// Get all bikes by BrandID with Brand navigation property
        /// </summary>
        public async Task<IEnumerable<EVBike>> GetBikesByBrandIDAsync(int brandId)
        {
            try
            {
                return await _context.EVBikes
                    .AsNoTracking()  // ✅ Read-only, no tracking needed
                    .Include(x => x.Brand)
                    .Where(bike => bike.BrandID == brandId)
                    .OrderByDescending(bike => bike.CreatedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting bikes by BrandID: {ex.Message}");
            }
        }

        /// <summary>
        /// Get bike by ID with Brand - read-only (no tracking)
        /// </summary>
        public async Task<EVBike?> GetByIdWithBrandAsync(int id)
        {
            try
            {
                return await _context.EVBikes
                    .AsNoTracking()  // ✅ Read-only, prevents tracking conflicts
                    .Include(x => x.Brand)
                    .FirstOrDefaultAsync(bike => bike.BikeID == id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting bike by ID: {ex.Message}");
            }
        }

        //get bike by id
        public async Task<EVBike?> GetBikeByIdAsync(int bikeID)
        {
            try
            {
                return await _context.EVBikes
                    .AsNoTracking()
                    .Include(b => b.Brand)// ✅ Read-only, prevents tracking conflicts
                    .FirstOrDefaultAsync(bike => bike.BikeID == bikeID);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting bike by ID: {ex.Message}");
            }
        }
    }
}