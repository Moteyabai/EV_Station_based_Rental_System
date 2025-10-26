using BusinessObject.Models;
using Repositories;
using Services.Interfaces;

namespace Services
{
    public class RenterService : IBaseService<Renter>
    {
        private readonly RenterRepository _renterRepository;

        public RenterService()
        {
            _renterRepository = RenterRepository.Instance;
        }

        public async Task AddAsync(Renter entity) => await _renterRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _renterRepository.DeleteAsync(id);

        public async Task<IEnumerable<Renter>> GetAllAsync() => await _renterRepository.GetAllAsync();

        public async Task<Renter> GetByIdAsync(int id) => await _renterRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Renter entity) => await _renterRepository.UpdateAsync(entity);

        public async Task<Renter> GetRenterByAccountIDAsync(int accID) => await _renterRepository.GetRenterByAccountIDAsync(accID);
    }
}