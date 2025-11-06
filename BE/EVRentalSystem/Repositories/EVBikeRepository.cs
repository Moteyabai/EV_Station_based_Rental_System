using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class EVBikeRepository : BaseRepository<EVBike>
    {
        private static EVBikeRepository instance;
        private static readonly object instancelock = new object();

        // Default constructor for backward compatibility
        public EVBikeRepository() : base()
        {
        }

        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public EVBikeRepository(EVRenterDBContext context) : base(context)
        {
        }

        // ⚠️ DEPRECATED: Singleton pattern - Use DI instead
        // This is kept for backward compatibility but should not be used
        public static EVBikeRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new EVBikeRepository();
                    }
                    return instance;
                }
            }
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
    }
}