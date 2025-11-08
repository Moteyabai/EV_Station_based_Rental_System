using BusinessObject.Models;
using Repositories;
using Repositories.DBContext;
using Services.Interfaces;

namespace Services
{
    public class StationStaffService : IBaseService<StationStaff>
    {
        private readonly StationStaffRepository _stationStaffRepository;

        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public StationStaffService(EVRenterDBContext context)
        {
            _stationStaffRepository = new StationStaffRepository(context);
        }

        public async Task AddAsync(StationStaff entity) => await _stationStaffRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _stationStaffRepository.DeleteAsync(id);

        public async Task<IEnumerable<StationStaff>> GetAllAsync() => await _stationStaffRepository.GetAllAsync();

        public async Task<StationStaff> GetByIdAsync(int id) => await _stationStaffRepository.GetByIdAsync(id);

        public async Task UpdateAsync(StationStaff entity) => await _stationStaffRepository.UpdateAsync(entity);

        public async Task<StationStaff> GetStaffByAccountID(int accountID) => await _stationStaffRepository.GetStaffByAccountID(accountID);
    }
}