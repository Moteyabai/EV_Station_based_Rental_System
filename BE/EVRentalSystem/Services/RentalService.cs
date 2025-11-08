using BusinessObject.Models;
using Repositories;
using Repositories.DBContext;
using Services.Interfaces;

namespace Services
{
    public class RentalService : IBaseService<Rental>
    {
        private readonly RentalRepository _rentalRepository;

        public RentalService(EVRenterDBContext context)
        {
            _rentalRepository = new RentalRepository(context);
        }

        public async Task AddAsync(Rental entity) => await _rentalRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _rentalRepository.DeleteAsync(id);

        public async Task<IEnumerable<Rental>> GetAllAsync() => await _rentalRepository.GetAllAsync();

        public async Task<Rental> GetByIdAsync(int id) => await _rentalRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Rental entity) => await _rentalRepository.UpdateAsync(entity);

        public async Task<Rental?> GetRentalByIDAsync(int rentID) => await _rentalRepository.GetRentalByIDAsync(rentID);

        public async Task<IEnumerable<Rental>> GetRentalsByRenterIDAsync(int renterID) => await _rentalRepository.GetRentalsByRenterIDAsync(renterID);
    }
}