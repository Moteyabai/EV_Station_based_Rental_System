using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;

namespace Repositories
{
    public class EVBike_StocksRepository : BaseRepository<EVBike_Stocks>
    {
        private static EVBike_StocksRepository instance;
        private static readonly object instancelock = new object();

        public EVBike_StocksRepository()
        {
        }

        public static EVBike_StocksRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new EVBike_StocksRepository();
                    }
                    return instance;
                }
            }
        }

        public async Task<List<EVBike_Stocks>> GetStocksByBikeIDAsync(int bikeID)
        {
            return await _context.EVBike_Stocks
                .Where(stock => stock.BikeID == bikeID)
                .ToListAsync();
        }

        public async Task<EVBike_Stocks> GetStockByLicensePlateAsync(string licensePlate)
        {
            return await _context.EVBike_Stocks
                .FirstOrDefaultAsync(stock => stock.LicensePlate == licensePlate);
        }
    }
}