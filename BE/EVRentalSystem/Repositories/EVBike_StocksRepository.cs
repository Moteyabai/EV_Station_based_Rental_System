using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class EVBike_StocksRepository : BaseRepository<EVBike_Stocks>
    {
        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public EVBike_StocksRepository(EVRenterDBContext context) : base(context)
        {
        }

        public async Task<List<EVBike_Stocks>> GetStocksByBikeIDAsync(int bikeID)
        {
            return await _context.EVBike_Stocks
                .Include(s => s.Station)
                .Where(stock => stock.BikeID == bikeID)
                .ToListAsync();
        }

        public async Task<EVBike_Stocks> GetStockByLicensePlateAsync(string licensePlate)
        {
            return await _context.EVBike_Stocks
                .FirstOrDefaultAsync(stock => stock.LicensePlate == licensePlate);
        }

        //Get 1 stock that is available from a specific bikeID
        public async Task<EVBike_Stocks?> GetAvailableStockByBikeIDAsync(int bikeID)
        {
            return await _context.EVBike_Stocks
                .FirstOrDefaultAsync(stock => stock.BikeID == bikeID && stock.Status == (int)BikeStatus.Available);
        }

        public async Task<List<EVBike_Stocks>> GetAvailbStocksAtStationByBikeIDAsync(int bikeID)
        {
            return await _context.EVBike_Stocks
                .Include(s => s.Station)
                .Where(stock => stock.BikeID == bikeID && stock.Status == (int)BikeStatus.Available)
                .ToListAsync();
        }

        /// <summary>
        /// Get stock count by bikeID - uses AsNoTracking for read-only operations
        /// </summary>
        public async Task<int> GetStockCountByBikeIDAsync(int bikeID)
        {
            // ✅ Use AsNoTracking to avoid tracking conflicts
            return await _context.EVBike_Stocks
                .AsNoTracking()
                .CountAsync(stock => stock.BikeID == bikeID);
        }
        public async Task<int> GetAvailableStockCountByBikeIDAsync(int bikeID)
        {
            // ✅ Use AsNoTracking to avoid tracking conflicts
            return await _context.EVBike_Stocks
                .AsNoTracking()
                .CountAsync(stock => stock.BikeID == bikeID && stock.Status == (int)BikeStatus.Available);
        }

        /// <summary>
        /// Get stock count by stationID - uses AsNoTracking for read-only operations
        /// </summary>
        public async Task<int> GetStockCountByStationIDAsync(int stationID)
        {
            // ✅ Use AsNoTracking to avoid tracking conflicts
            return await _context.EVBike_Stocks
                .AsNoTracking()
                .CountAsync(stock => stock.StationID == stationID);
        }

        /// <summary>
        /// Get list of stations that have available stock for a specific BikeID
        /// </summary>
        public async Task<List<Station>> GetStationsWithAvailableStockByBikeIDAsync(int bikeID)
        {
            try
            {
                var stations = await _context.EVBike_Stocks
                    .AsNoTracking()  // ✅ No tracking needed for read-only
                    .Include(s => s.Station)
                    .Where(stock => stock.BikeID == bikeID && stock.Status == (int)BikeStatus.Available)
                    .Select(stock => stock.Station)
                    .Distinct()
                    .ToListAsync();

                return stations;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting stations with available stock: {ex.Message}");
            }
        }



        //get availble stocks at a station
        public async Task<List<EVBike_Stocks>> GetAvailableStocksAtStationAsync(int stationID)
        {
            return await _context.EVBike_Stocks
                .Include(s => s.Station)
                .Where(stock => stock.StationID == stationID && stock.Status == (int)BikeStatus.Available)
                .ToListAsync();
        }

        //get all stocks at station
        public async Task<List<EVBike_Stocks>> GetAllStocksAtStationAsync(int stationID)
        {
            return await _context.EVBike_Stocks
                .Include(s => s.Station)
                .Where(stock => stock.StationID == stationID)
                .ToListAsync();
        }

        /// <summary>
        /// Count all stocks at a station
        /// </summary>
        public async Task<int> CountAllStocksAtStationAsync(int stationID)
        {
            return await _context.EVBike_Stocks
                .AsNoTracking()
                .CountAsync(stock => stock.StationID == stationID);
        }

    }
}