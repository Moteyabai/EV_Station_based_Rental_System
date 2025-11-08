using BusinessObject.Models;
using Repositories;
using Repositories.DBContext;
using Services.Interfaces;

namespace Services
{
    public class BrandService : IBaseService<Brand>
    {
        private readonly BrandRepository _brandRepository;

        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public BrandService(EVRenterDBContext context)
        {
            _brandRepository = new BrandRepository(context);
        }

        public async Task AddAsync(Brand entity) => await _brandRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _brandRepository.DeleteAsync(id);

        public async Task<IEnumerable<Brand>> GetAllAsync() => await _brandRepository.GetAllAsync();

        public async Task<Brand> GetByIdAsync(int id) => await _brandRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Brand entity) => await _brandRepository.UpdateAsync(entity);
    }
}
