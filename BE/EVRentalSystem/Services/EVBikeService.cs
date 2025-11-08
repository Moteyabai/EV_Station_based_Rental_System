using BusinessObject.Models;
using Repositories;
using Repositories.DBContext;
using Services.Interfaces;

namespace Services
{
    public class EVBikeService : IBaseService<EVBike>
    {
        private readonly EVBikeRepository _repository;


        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public EVBikeService(EVRenterDBContext context)
        {
            _repository = new EVBikeRepository(context);
        }

        public async Task AddAsync(EVBike entity) => await _repository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);

        public async Task<IEnumerable<EVBike>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<EVBike> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

        public async Task UpdateAsync(EVBike entity) => await _repository.UpdateAsync(entity);

        public async Task<IEnumerable<EVBike>> GetAvailableBikesAsync() => await _repository.GetAvailableBikesAsync();

        public async Task<IEnumerable<EVBike>> GetBikesByBrandIDAsync(int brandId) => await _repository.GetBikesByBrandIDAsync(brandId);

        /// <summary>
        /// Get bike by ID with Brand - read-only (no tracking)
        /// Use this for display purposes to avoid tracking conflicts
        /// </summary>
        public async Task<EVBike?> GetByIdWithBrandAsync(int id) => await _repository.GetByIdWithBrandAsync(id);
    }
}