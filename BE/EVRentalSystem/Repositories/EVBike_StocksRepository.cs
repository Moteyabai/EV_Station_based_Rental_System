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

        /// <summary>
        /// Get count of available bikes by BikeID at each station
        /// </summary>
        public async Task<Dictionary<int, int>> GetAvailableStockCountByStationAsync(int bikeID)
        {
            try
            {
                var stockCounts = await _context.EVBike_Stocks
                    .AsNoTracking()  // ✅ No tracking needed for aggregation
                    .Where(stock => stock.BikeID == bikeID && stock.Status == (int)BikeStatus.Available)
                    .GroupBy(stock => stock.StationID)
                    .Select(group => new
                    {
                        StationID = group.Key,
                        Count = group.Count()
                    })
                    .ToDictionaryAsync(x => x.StationID, x => x.Count);

                return stockCounts;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting available stock count by station: {ex.Message}");
            }
        }
    }
}