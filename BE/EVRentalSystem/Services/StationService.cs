using BusinessObject.Models;
using Repositories;
using Repositories.DBContext;
using Services.Interfaces;

namespace Services
{
    public class StationService : IBaseService<Station>
    {
        private readonly StationRepository _stationRepository;

        public StationService(EVRenterDBContext context)
        {
            _stationRepository = new StationRepository(context);
        }

        public async Task AddAsync(Station entity) => await _stationRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _stationRepository.DeleteAsync(id);

        public async Task<IEnumerable<Station>> GetAllAsync() => await _stationRepository.GetAllAsync();

        public async Task<Station> GetByIdAsync(int id) => await _stationRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Station entity) => await _stationRepository.UpdateAsync(entity);
        public async Task<IEnumerable<Station>> GetActiveStationsAsync() => await _stationRepository.GetActiveStationsAsync();

        // Additional business methods for Station

        public async Task<IEnumerable<Station>> GetInactiveStationsAsync()
        {
            var stations = await GetAllAsync();
            return stations.Where(s => !s.IsActive);
        }

        public async Task<IEnumerable<Station>> SearchStationsByNameAsync(string searchTerm)
        {
            var stations = await GetAllAsync();
            return stations.Where(s => s.Name.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<IEnumerable<Station>> SearchStationsByAddressAsync(string searchTerm)
        {
            var stations = await GetAllAsync();
            return stations.Where(s => s.Address.Contains(searchTerm, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<IEnumerable<Station>> GetStationsWithAvailableBikesAsync()
        {
            var stations = await GetAllAsync();
            // This would need to be implemented with actual bike availability logic
            // For now, return all active stations
            return stations.Where(s => s.IsActive);
        }

        public async Task<IEnumerable<Station>> GetStationsCreatedAfterAsync(DateTime date)
        {
            var stations = await GetAllAsync();
            return stations.Where(s => s.CreatedAt >= date);
        }

        public async Task<IEnumerable<Station>> GetStationsUpdatedAfterAsync(DateTime date)
        {
            var stations = await GetAllAsync();
            return stations.Where(s => s.UpdatedAt >= date);
        }

        public async Task<Station?> GetStationByNameAsync(string name)
        {
            var stations = await GetAllAsync();
            return stations.FirstOrDefault(s => s.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
        }

        public async Task ActivateStationAsync(int stationId)
        {
            var station = await GetByIdAsync(stationId);
            if (station != null)
            {
                station.IsActive = true;
                station.UpdatedAt = DateTime.Now;
                await UpdateAsync(station);
            }
        }

        public async Task DeactivateStationAsync(int stationId)
        {
            var station = await GetByIdAsync(stationId);
            if (station != null)
            {
                station.IsActive = false;
                station.UpdatedAt = DateTime.Now;
                await UpdateAsync(station);
            }
        }
    }
}