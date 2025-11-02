using BusinessObject.Models;
using Repositories;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    public class BrandService : IBaseService<Brand>
    {
        private readonly BrandRepository _brandRepository;
        public BrandService()
        {
            _brandRepository = BrandRepository.Instance;
        }
        public async Task AddAsync(Brand entity) => await _brandRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _brandRepository.DeleteAsync(id);

        public async Task<IEnumerable<Brand>> GetAllAsync() => await _brandRepository.GetAllAsync();

        public async Task<Brand> GetByIdAsync(int id) => await _brandRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Brand entity) => await _brandRepository.UpdateAsync(entity);
    }
}
