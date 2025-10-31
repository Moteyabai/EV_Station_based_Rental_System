# Get Stations with Available Stock by BikeID - Documentation

## Overview
Added functionality to retrieve a list of stations that have available bike stock for a specific BikeID. This is useful for customers to find where they can rent a specific bike model.

---

## Changes Made

### 1. **EVBike_StocksRepository.cs**
**Location:** `Repositories/EVBike_StocksRepository.cs`

**New Methods:**

#### Method 1: GetStationsWithAvailableStockByBikeIDAsync
```csharp
/// <summary>
/// Get list of stations that have available stock for a specific BikeID
/// </summary>
public async Task<List<Station>> GetStationsWithAvailableStockByBikeIDAsync(int bikeID)
{
    try
    {
        var stations = await _context.EVBike_Stocks
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
```

**Features:**
- ? Filters by BikeID and Available status
- ? Includes Station navigation property
- ? Returns distinct stations (no duplicates)
- ? Proper error handling

#### Method 2: GetAvailableStockCountByStationAsync
```csharp
/// <summary>
/// Get count of available bikes by BikeID at each station
/// </summary>
public async Task<Dictionary<int, int>> GetAvailableStockCountByStationAsync(int bikeID)
{
    try
    {
        var stockCounts = await _context.EVBike_Stocks
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
```

**Features:**
- ? Groups stocks by StationID
- ? Returns count per station as Dictionary
- ? Only counts available bikes

---

### 2. **EVBike_StocksService.cs**
**Location:** `Services/EVBike_StocksService.cs`

**New Methods:**
```csharp
public async Task<List<Station>> GetStationsWithAvailableStockByBikeIDAsync(int bikeID) 
    => await _evBikeStocksRepository.GetStationsWithAvailableStockByBikeIDAsync(bikeID);

public async Task<Dictionary<int, int>> GetAvailableStockCountByStationAsync(int bikeID) 
    => await _evBikeStocksRepository.GetAvailableStockCountByStationAsync(bikeID);
```

---

### 3. **New DTOs**
**Location:** `BusinessObject/Models/DTOs/StationWithStockDTO.cs`

#### StationWithStockDTO
```csharp
public class StationWithStockDTO
{
    public int StationID { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ContactNumber { get; set; } = string.Empty;
    public string OpeningHours { get; set; } = "24/7";
    public bool IsActive { get; set; }
    public int AvailableStockCount { get; set; }
    public string? ImageUrl { get; set; }
    public string? ThumbnailImageUrl { get; set; }
}
```

#### StationStockSummaryDTO
```csharp
public class StationStockSummaryDTO
{
    public int BikeID { get; set; }
    public string BikeName { get; set; } = string.Empty;
    public string BrandName { get; set; } = string.Empty;
    public int TotalStationsWithStock { get; set; }
    public int TotalAvailableStock { get; set; }
    public List<StationWithStockDTO> Stations { get; set; } = new();
}
```

---

### 4. **EVBike_StocksController.cs**
**Location:** `API/Controllers/EVBike_StocksController.cs`

**New Endpoints:**

#### Endpoint 1: GetStationsWithAvailableStock
```csharp
/// <summary>
/// Get list of stations that have available stock for a specific BikeID (Public access)
/// </summary>
[HttpGet("GetStationsWithAvailableStock/{bikeId}")]
public async Task<ActionResult<IEnumerable<StationWithStockDTO>>> GetStationsWithAvailableStock(int bikeId)
```

**Request:**
```http
GET /api/EVBike_Stocks/GetStationsWithAvailableStock/1
```

**Response (Success - 200 OK):**
```json
[
  {
    "stationID": 1,
    "name": "Tr?m EV Công Viên Tao ?àn",
    "address": "123 Tr??ng ??nh, Ph??ng B?n Thành, Qu?n 1, TP.HCM",
    "description": "Tr?m thuê xe ?i?n l?n nh?t",
    "contactNumber": "0901234567",
    "openingHours": "24/7",
    "isActive": true,
    "availableStockCount": 5,
    "imageUrl": "https://...",
    "thumbnailImageUrl": "https://..."
  },
  {
    "stationID": 3,
    "name": "Tr?m EV Trung Tâm Qu?n 1",
    "address": "789 Nguy?n Hu?, Ph??ng B?n Nghé, Qu?n 1, TP.HCM",
    "description": "T?a l?c t?i trung tâm thành ph?",
    "contactNumber": "0912345678",
    "openingHours": "6:00 - 24:00",
    "isActive": true,
    "availableStockCount": 3,
    "imageUrl": "https://...",
    "thumbnailImageUrl": "https://..."
  }
]
```

**Response (Not Found - 404):**
```json
{
  "message": "Hi?n không có tr?m nào có xe này!"
}
```

**Features:**
- ? Public access (no authentication required)
- ? Validates BikeID exists
- ? Returns stations ordered by stock count (descending)
- ? Includes available stock count per station

---

#### Endpoint 2: GetStationStockSummary
```csharp
/// <summary>
/// Get detailed summary of stations with available stock for a specific BikeID (Public access)
/// </summary>
[HttpGet("GetStationStockSummary/{bikeId}")]
public async Task<ActionResult<StationStockSummaryDTO>> GetStationStockSummary(int bikeId)
```

**Request:**
```http
GET /api/EVBike_Stocks/GetStationStockSummary/1
```

**Response (Success - 200 OK):**
```json
{
  "bikeID": 1,
  "bikeName": "VinFast Klara S",
  "brandName": "VinFast",
  "totalStationsWithStock": 3,
  "totalAvailableStock": 12,
  "stations": [
    {
      "stationID": 1,
      "name": "Tr?m EV Công Viên Tao ?àn",
      "address": "123 Tr??ng ??nh, Ph??ng B?n Thành, Qu?n 1, TP.HCM",
      "description": "Tr?m thuê xe ?i?n l?n nh?t",
      "contactNumber": "0901234567",
      "openingHours": "24/7",
      "isActive": true,
      "availableStockCount": 5,
      "imageUrl": "https://...",
      "thumbnailImageUrl": "https://..."
    },
    {
      "stationID": 2,
      "name": "Tr?m EV B? Sông Sài Gòn",
      "address": "456 Tôn ??c Th?ng, Ph??ng B?n Nghé, Qu?n 1, TP.HCM",
      "description": "V? trí ??p bên b? sông",
      "contactNumber": "0923456789",
      "openingHours": "7:00 - 22:00",
      "isActive": true,
      "availableStockCount": 4,
      "imageUrl": "https://...",
      "thumbnailImageUrl": "https://..."
    },
    {
      "stationID": 3,
      "name": "Tr?m EV Trung Tâm Qu?n 1",
      "address": "789 Nguy?n Hu?, Ph??ng B?n Nghé, Qu?n 1, TP.HCM",
      "description": "T?a l?c t?i trung tâm thành ph?",
      "contactNumber": "0912345678",
      "openingHours": "6:00 - 24:00",
      "isActive": true,
      "availableStockCount": 3,
      "imageUrl": "https://...",
      "thumbnailImageUrl": "https://..."
    }
  ]
}
```

**Features:**
- ? Comprehensive bike and stock information
- ? Includes total stations and total available stock
- ? List of all stations with their stock counts
- ? Ordered by availability (most stock first)

---

## API Endpoint Details

### Endpoint 1: GetStationsWithAvailableStock

**Information:**
- **Method:** GET
- **Route:** `/api/EVBike_Stocks/GetStationsWithAvailableStock/{bikeId}`
- **Authorization:** Not required (Public)
- **Parameters:**
  - `bikeId` (int, path parameter) - The ID of the bike

**Use Cases:**
1. **Map View** - Show pins on map for stations with this bike
2. **Station Selector** - Let user choose pickup station
3. **Availability Checker** - Quick check if bike is available

---

### Endpoint 2: GetStationStockSummary

**Information:**
- **Method:** GET
- **Route:** `/api/EVBike_Stocks/GetStationStockSummary/{bikeId}`
- **Authorization:** Not required (Public)
- **Parameters:**
  - `bikeId` (int, path parameter) - The ID of the bike

**Use Cases:**
1. **Bike Detail Page** - Show comprehensive availability
2. **Rental Flow** - Display all options to customer
3. **Analytics** - Track bike distribution

---

## Frontend Integration Examples

### Example 1: Display Stations on Map
```javascript
const BikeAvailabilityMap = ({ bikeId }) => {
  const [stations, setStations] = useState([]);
  
  useEffect(() => {
    fetchStationsWithStock();
  }, [bikeId]);
  
  const fetchStationsWithStock = async () => {
    try {
      const response = await fetch(
        `/api/EVBike_Stocks/GetStationsWithAvailableStock/${bikeId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setStations(data);
      } else {
        const error = await response.json();
        console.error(error.message);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };
  
  return (
    <Map>
      {stations.map(station => (
        <Marker
          key={station.stationID}
          position={[station.latitude, station.longitude]}
          label={`${station.name} (${station.availableStockCount} xe)`}
        />
      ))}
    </Map>
  );
};
```

### Example 2: Bike Detail Page with Availability
```javascript
const BikeDetailPage = ({ bikeId }) => {
  const [summary, setSummary] = useState(null);
  
  useEffect(() => {
    fetchStockSummary();
  }, [bikeId]);
  
  const fetchStockSummary = async () => {
    try {
      const response = await fetch(
        `/api/EVBike_Stocks/GetStationStockSummary/${bikeId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };
  
  if (!summary) return <Loading />;
  
  return (
    <div>
      <h2>{summary.bikeName}</h2>
      <p>Brand: {summary.brandName}</p>
      <div className="availability-summary">
        <p>Có s?n t?i {summary.totalStationsWithStock} tr?m</p>
        <p>T?ng c?ng {summary.totalAvailableStock} xe</p>
      </div>
      
      <h3>Tr?m có xe:</h3>
      <div className="stations-list">
        {summary.stations.map(station => (
          <div key={station.stationID} className="station-card">
            <img src={station.thumbnailImageUrl} alt={station.name} />
            <h4>{station.name}</h4>
            <p>{station.address}</p>
            <p className="stock-count">
              Còn {station.availableStockCount} xe
            </p>
            <p>Gi? m? c?a: {station.openingHours}</p>
            <p>Liên h?: {station.contactNumber}</p>
            <button onClick={() => selectStation(station.stationID)}>
              Ch?n tr?m này
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Example 3: Station Selector Component
```javascript
const StationSelector = ({ bikeId, onStationSelect }) => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  
  useEffect(() => {
    fetchStations();
  }, [bikeId]);
  
  const fetchStations = async () => {
    const response = await fetch(
      `/api/EVBike_Stocks/GetStationsWithAvailableStock/${bikeId}`
    );
    if (response.ok) {
      const data = await response.json();
      setStations(data);
    }
  };
  
  const handleSelect = (station) => {
    setSelectedStation(station);
    onStationSelect(station);
  };
  
  return (
    <div className="station-selector">
      <h3>Ch?n ?i?m nh?n xe:</h3>
      {stations.map(station => (
        <div 
          key={station.stationID}
          className={`station-option ${
            selectedStation?.stationID === station.stationID ? 'selected' : ''
          }`}
          onClick={() => handleSelect(station)}
        >
          <div className="station-name">{station.name}</div>
          <div className="station-address">{station.address}</div>
          <div className="stock-badge">
            {station.availableStockCount} xe có s?n
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Example 4: Combine with Other APIs
```javascript
// Get bike details with stations in one call
const fetchBikeWithStations = async (bikeId) => {
  const [bikeInfo, stockSummary] = await Promise.all([
    fetch(`/api/EVBike/GetBikeByID/${bikeId}`).then(r => r.json()),
    fetch(`/api/EVBike_Stocks/GetStationStockSummary/${bikeId}`).then(r => r.json())
  ]);
  
  return {
    bike: bikeInfo,
    availability: stockSummary
  };
};
```

---

## Database Queries

### Query 1: GetStationsWithAvailableStockByBikeIDAsync
```sql
SELECT DISTINCT s.*
FROM EVBike_Stocks es
INNER JOIN Stations s ON es.StationID = s.StationID
WHERE es.BikeID = @bikeID 
  AND es.Status = 1  -- Available
```

### Query 2: GetAvailableStockCountByStationAsync
```sql
SELECT 
    StationID,
    COUNT(*) as Count
FROM EVBike_Stocks
WHERE BikeID = @bikeID 
  AND Status = 1  -- Available
GROUP BY StationID
```

---

## Performance Considerations

- ? **Indexed Queries**: Uses BikeID and Status (consider composite index)
- ? **Distinct Results**: Removes duplicate stations
- ? **Eager Loading**: Includes Station navigation property
- ? **Aggregation**: Groups by StationID for counts
- ? **Sorting**: Orders by stock count (client-side currently)

### Suggested Index
```sql
CREATE INDEX IX_EVBike_Stocks_BikeID_Status 
ON EVBike_Stocks(BikeID, Status)
INCLUDE (StationID);
```

---

## Testing

### Test 1: Get Stations for VinFast Klara S
```http
GET http://localhost:5168/api/EVBike_Stocks/GetStationsWithAvailableStock/1
```

**Expected:** List of stations with available VinFast Klara S bikes

### Test 2: Get Summary for Bike
```http
GET http://localhost:5168/api/EVBike_Stocks/GetStationStockSummary/1
```

**Expected:** Comprehensive summary with bike info and stations

### Test 3: Non-existent Bike
```http
GET http://localhost:5168/api/EVBike_Stocks/GetStationsWithAvailableStock/999
```

**Expected:** 404 Not Found with message "Không tìm th?y xe ?i?n v?i ID: 999"

### Test 4: Bike with No Available Stock
```http
GET http://localhost:5168/api/EVBike_Stocks/GetStationsWithAvailableStock/5
```

**Expected:** 404 Not Found with message "Hi?n không có tr?m nào có xe này!"

---

## Related Endpoints

Works well with:
- `GET /api/EVBike/GetBikeByID/{id}` - Get bike details
- `GET /api/EVBike/GetBikesByBrandID/{brandId}` - Get bikes by brand
- `GET /api/Station/GetAllStations` - Get all stations
- `GET /api/EVBike_Stocks/GetStocksByBikeID/{bikeId}` - Get all stocks (Admin/Staff)

---

## Future Enhancements

### 1. Add Distance Sorting
```csharp
[HttpGet("GetNearbyStationsWithStock/{bikeId}")]
public async Task<ActionResult> GetNearbyStationsWithStock(
    int bikeId, 
    double userLat, 
    double userLng, 
    int maxDistanceKm = 10)
{
    var stations = await _evBikeStocksService
        .GetStationsWithAvailableStockByBikeIDAsync(bikeId);
    
    // Calculate distance and filter
    var nearbyStations = stations
        .Select(s => new {
            Station = s,
            Distance = CalculateDistance(userLat, userLng, s.Latitude, s.Longitude)
        })
        .Where(x => x.Distance <= maxDistanceKm)
        .OrderBy(x => x.Distance)
        .Select(x => x.Station)
        .ToList();
    
    return Ok(nearbyStations);
}
```

### 2. Add Real-time Stock Updates
```csharp
// Use SignalR for real-time updates
public async Task NotifyStockChange(int bikeId, int stationId)
{
    var stockCount = await GetStockCountAtStation(bikeId, stationId);
    await Clients.All.SendAsync("StockUpdated", bikeId, stationId, stockCount);
}
```

### 3. Add Reservation Hold
```csharp
public async Task<bool> HoldStockForReservation(int stockId, int minutes = 15)
{
    // Temporarily mark stock as "reserved" for X minutes
    // Prevent overbooking
}
```

---

## Build Status

? **All changes compile successfully**
? **No breaking changes**
? **DTOs created**
? **Repository methods added**
? **Service methods added**
? **Controller endpoints added**
? **Public access (no auth required)**
? **Ready for testing**

---

## Summary

### New Repository Methods:
1. ? `GetStationsWithAvailableStockByBikeIDAsync(int bikeId)` - Returns distinct stations
2. ? `GetAvailableStockCountByStationAsync(int bikeId)` - Returns stock counts

### New Service Methods:
1. ? `GetStationsWithAvailableStockByBikeIDAsync(int bikeId)`
2. ? `GetAvailableStockCountByStationAsync(int bikeId)`

### New API Endpoints:
1. ? `GET /api/EVBike_Stocks/GetStationsWithAvailableStock/{bikeId}` - List stations
2. ? `GET /api/EVBike_Stocks/GetStationStockSummary/{bikeId}` - Detailed summary

### New DTOs:
1. ? `StationWithStockDTO` - Station info with stock count
2. ? `StationStockSummaryDTO` - Complete summary with bike and stations

---

**Feature complete and ready for production use!** ??
