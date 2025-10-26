using BusinessObject.Models;
using Repositories;
using Services.Interfaces;

namespace Services
{
    public class EVBike_StocksService : IBaseService<EVBike_Stocks>
    {
        private readonly EVBike_StocksRepository _evBikeStocksRepository;

        public EVBike_StocksService()
        {
            _evBikeStocksRepository = EVBike_StocksRepository.Instance;
        }

        public async Task AddAsync(EVBike_Stocks entity) => await _evBikeStocksRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _evBikeStocksRepository.DeleteAsync(id);

        public async Task<IEnumerable<EVBike_Stocks>> GetAllAsync() => await _evBikeStocksRepository.GetAllAsync();

        public async Task<EVBike_Stocks> GetByIdAsync(int id) => await _evBikeStocksRepository.GetByIdAsync(id);

        public async Task UpdateAsync(EVBike_Stocks entity) => await _evBikeStocksRepository.UpdateAsync(entity);

        public async Task<List<EVBike_Stocks>> GetStocksByBikeIDAsync(int bikeID) => await _evBikeStocksRepository.GetStocksByBikeIDAsync(bikeID);

        public async Task<EVBike_Stocks> GetStockByLicensePlateAsync(string licensePlate) => await _evBikeStocksRepository.GetStockByLicensePlateAsync(licensePlate);
    }
}