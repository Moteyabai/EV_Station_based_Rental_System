using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

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
            using (var context = new EVRenterDBContext())
                return await context.EVBike_Stocks
                .Include(s => s.Station)
                .Where(stock => stock.BikeID == bikeID)
                .ToListAsync();
        }

        public async Task<EVBike_Stocks> GetStockByLicensePlateAsync(string licensePlate)
        {
            using (var context = new EVRenterDBContext())
            {
                return await context.EVBike_Stocks
                    .FirstOrDefaultAsync(stock => stock.LicensePlate == licensePlate);
            }
        }

        //Get 1 stock that is available from a specific bikeID
        public async Task<EVBike_Stocks?> GetAvailableStockByBikeIDAsync(int bikeID)
        {
            using (var context = new EVRenterDBContext())
                return await context.EVBike_Stocks
                .FirstOrDefaultAsync(stock => stock.BikeID == bikeID && stock.Status == (int)BikeStatus.Available);
        }

        public async Task<List<EVBike_Stocks>> GetAvailbStocksAtStationByBikeIDAsync(int bikeID)
        {
            using (var context = new EVRenterDBContext())
                return await context.EVBike_Stocks
                .Include(s => s.Station)
                .Where(stock => stock.BikeID == bikeID && stock.Status == (int)BikeStatus.Available)
                .ToListAsync();
        }

        //stock countby bikeID
        public async Task<int> GetStockCountByBikeIDAsync(int bikeID)
        {
            using (var context = new EVRenterDBContext())
                return await context.EVBike_Stocks
                .CountAsync(stock => stock.BikeID == bikeID);
        }

        //stock count by stationID
        public async Task<int> GetStockCountByStationIDAsync(int stationID)
        {
            using (var context = new EVRenterDBContext())
                return await context.EVBike_Stocks
                .CountAsync(stock => stock.StationID == stationID);
        }

    }
}