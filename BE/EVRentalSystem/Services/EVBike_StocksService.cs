using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories;
using Repositories.DBContext;
using Services.Interfaces;

namespace Services
{
    public class EVBike_StocksService : IBaseService<EVBike_Stocks>
    {
        private readonly EVBike_StocksRepository _evBikeStocksRepository;

        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public EVBike_StocksService(EVRenterDBContext context)
        {
            _evBikeStocksRepository = new EVBike_StocksRepository(context);
        }

        public async Task AddAsync(EVBike_Stocks entity) => await _evBikeStocksRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _evBikeStocksRepository.DeleteAsync(id);

        public async Task<IEnumerable<EVBike_Stocks>> GetAllAsync() => await _evBikeStocksRepository.GetAllAsync();

        public async Task<EVBike_Stocks> GetByIdAsync(int id) => await _evBikeStocksRepository.GetByIdAsync(id);

        public async Task UpdateAsync(EVBike_Stocks entity) => await _evBikeStocksRepository.UpdateAsync(entity);

        public async Task<List<EVBike_Stocks>> GetStocksByBikeIDAsync(int bikeID) => await _evBikeStocksRepository.GetStocksByBikeIDAsync(bikeID);

        public async Task<EVBike_Stocks> GetStockByLicensePlateAsync(string licensePlate) => await _evBikeStocksRepository.GetStockByLicensePlateAsync(licensePlate);

        public async Task<EVBike_Stocks?> GetAvailableStockByBikeIDAsync(int bikeID) => await _evBikeStocksRepository.GetAvailableStockByBikeIDAsync(bikeID);

        public async Task<List<EVBike_Stocks>> GetAvailbStocksAtStationByBikeIDAsync(int bikeID) => await _evBikeStocksRepository.GetAvailbStocksAtStationByBikeIDAsync(bikeID);

        public async Task<int> GetStockCountByBikeIDAsync(int bikeID) => await _evBikeStocksRepository.GetStockCountByBikeIDAsync(bikeID);

        public async Task<int> GetStockCountByStationIDAsync(int stationID) => await _evBikeStocksRepository.GetStockCountByStationIDAsync(stationID);

        public async Task<List<Station>> GetStationsWithAvailableStockByBikeIDAsync(int bikeID) => await _evBikeStocksRepository.GetStationsWithAvailableStockByBikeIDAsync(bikeID);

        public async Task<int> GetAvailableStockCountByBikeIDAsync(int bikeID) => await _evBikeStocksRepository.GetAvailableStockCountByBikeIDAsync(bikeID);
        public async Task<List<EVBike_Stocks>> GetAvailableStocksAtStationAsync(int stationID) => await _evBikeStocksRepository.GetAvailableStocksAtStationAsync(stationID);
        public async Task<List<EVBike_Stocks>> GetAllStocksAtStationAsync(int stationID) => await _evBikeStocksRepository.GetAllStocksAtStationAsync(stationID);
    }
}