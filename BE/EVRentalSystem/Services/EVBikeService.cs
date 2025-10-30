using BusinessObject.Models;
using Repositories;
using Services.Interfaces;

namespace Services
{
    public class EVBikeService : IBaseService<EVBike>
    {
        private readonly EVBikeRepository _repository;

        public EVBikeService()
        {
            _repository = EVBikeRepository.Instance;
        }

        public async Task AddAsync(EVBike entity) => await _repository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);

        public async Task<IEnumerable<EVBike>> GetAllAsync() => await _repository.GetAllAsync();

        public async Task<EVBike> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);

        public async Task UpdateAsync(EVBike entity) => await _repository.UpdateAsync(entity);

        public async Task<IEnumerable<EVBike>> GetAvailableBikesAsync() => await _repository.GetAvailableBikesAsync();
    }
}