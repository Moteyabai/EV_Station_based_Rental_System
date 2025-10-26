using BusinessObject.Models;
using Repositories;
using Services.Interfaces;

namespace Services
{
    public class RentalService : IBaseService<Rental>
    {
        private readonly RentalRepository _rentalRepository;

        public RentalService()
        {
            _rentalRepository = RentalRepository.Instance;
        }

        public async Task AddAsync(Rental entity) => await _rentalRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _rentalRepository.DeleteAsync(id);

        public async Task<IEnumerable<Rental>> GetAllAsync() => await _rentalRepository.GetAllAsync();

        public async Task<Rental> GetByIdAsync(int id) => await _rentalRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Rental entity) => await _rentalRepository.UpdateAsync(entity);

        // Additional business methods for Rental
        public async Task<IEnumerable<Rental>> GetRentalsByRenterAsync(int renterId)
        {
            var rentals = await GetAllAsync();
            return rentals.Where(r => r.RenterID == renterId);
        }

        public async Task<IEnumerable<Rental>> GetRentalsByBikeAsync(int bikeId)
        {
            var rentals = await GetAllAsync();
            return rentals.Where(r => r.BikeID == bikeId);
        }

        public async Task<IEnumerable<Rental>> GetRentalsByStationAsync(int stationId)
        {
            var rentals = await GetAllAsync();
            return rentals.Where(r => r.StationID == stationId);
        }

        public async Task<IEnumerable<Rental>> GetActiveRentalsAsync()
        {
            var rentals = await GetAllAsync();
            var currentDate = DateTime.Now;
            return rentals.Where(r => r.RentalDate <= currentDate &&
                                     (!r.ReturnDate.HasValue || r.ReturnDate >= currentDate));
        }

        public async Task<IEnumerable<Rental>> GetPendingRentalsAsync()
        {
            var rentals = await GetAllAsync();
            var currentDate = DateTime.Now;
            return rentals.Where(r => r.RentalDate > currentDate);
        }

        public async Task<IEnumerable<Rental>> GetCompletedRentalsAsync()
        {
            var rentals = await GetAllAsync();
            var currentDate = DateTime.Now;
            return rentals.Where(r => r.ReturnDate.HasValue && r.ReturnDate < currentDate);
        }

        public async Task<IEnumerable<Rental>> GetRentalsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var rentals = await GetAllAsync();
            return rentals.Where(r => r.RentalDate >= startDate && r.RentalDate <= endDate);
        }
    }
}