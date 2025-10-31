using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;

namespace Repositories
{
    public class EVBikeRepository : BaseRepository<EVBike>
    {
        private static EVBikeRepository instance;
        private static readonly object instancelock = new object();

        public EVBikeRepository()
        {
        }

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
                return await _context.EVBikes.Include(x=> x.Brand).Where(bike => bike.Status == (int)BikeStatus.Available).ToListAsync();
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
    }
}