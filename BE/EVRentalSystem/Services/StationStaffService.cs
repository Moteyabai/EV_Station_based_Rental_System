using BusinessObject.Models;
using Repositories;
using Services.Interfaces;

namespace Services
{
    public class StationStaffService : IBaseService<StationStaff>
    {
        private readonly StationStaffRepository _stationStaffRepository;

        public StationStaffService()
        {
            _stationStaffRepository = StationStaffRepository.Instance;
        }

        public async Task AddAsync(StationStaff entity) => await _stationStaffRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _stationStaffRepository.DeleteAsync(id);

        public async Task<IEnumerable<StationStaff>> GetAllAsync() => await _stationStaffRepository.GetAllAsync();

        public async Task<StationStaff> GetByIdAsync(int id) => await _stationStaffRepository.GetByIdAsync(id);

        public async Task UpdateAsync(StationStaff entity) => await _stationStaffRepository.UpdateAsync(entity);
    }
}