# Migration Plan: Mock Data → Backend API

## ⚠️ Hiện trạng

Mock data (`src/data/stations.js` và `src/data/vehicles.js`) đang được sử dụng ở nhiều component.

## 📋 Files cần cập nhật để migrate sang API

### 1. Stations Mock Data (`src/data/stations.js`)

**Đang được import ở:**

- ✅ `src/pages/Checkout.jsx` - ĐÃ CHUYỂN SANG API `fetchStationById()`
- ❌ `src/pages/Home.jsx` - Cần migrate
- ❌ `src/pages/Stations.jsx` - Cần migrate
- ❌ `src/pages/StationDetail.jsx` - Cần migrate
- ❌ `src/components/BookingForm.jsx` - Cần migrate
- ❌ `src/components/StationFinder.jsx` - Cần migrate

**API đã có sẵn:**

- `fetchAllStations()` - GET /api/Station/GetAllStations
- `fetchActiveStations()` - GET /api/Station/GetActiveStations
- `fetchStationById(id, token)` - GET /api/Station/GetStationById/{id}

### 2. Vehicles Mock Data (`src/data/vehicles.js`)

**Đang được import ở:**

- ✅ `src/pages/Checkout.jsx` - ĐÃ CHUYỂN SANG API `getBikeById()`
- ❌ `src/pages/Home.jsx` - Cần migrate
- ❌ `src/pages/Vehicles.jsx` - Cần migrate
- ❌ `src/pages/ProductDetail.jsx` - Cần migrate

**API đã có sẵn:**

- `getBikeById(bikeId, token)` - GET /api/EVBike/GetBikeByID/{id}
- `getBikesByStation(stationId, token)` - GET /api/EVBike/GetBikesByStation/{stationId}

## 🔄 Cách migrate từng file

### Home.jsx

**Hiện tại:**

```javascript
import stations from "../data/stations";
import vehicles from "../data/vehicles";

const featuredStations = stations.slice(0, 3);
const featuredVehicles = vehicles.slice(0, 6);
```

**Sau khi migrate:**

```javascript
import { fetchAllStations } from "../api/stations";
// API cho vehicles chưa có endpoint GetAllBikes

const [stations, setStations] = useState([]);
const [vehicles, setVehicles] = useState([]);

useEffect(() => {
  const loadData = async () => {
    const stationsData = await fetchAllStations();
    setStations(stationsData.slice(0, 3));
    // TODO: Cần tạo API getBikes() để lấy tất cả bikes
  };
  loadData();
}, []);
```

### Stations.jsx

**Hiện tại:**

```javascript
import stationsData from "../data/stations";
const [stations] = useState(stationsData);
```

**Sau khi migrate:**

```javascript
import { fetchAllStations } from "../api/stations";

const [stations, setStations] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadStations = async () => {
    try {
      const data = await fetchAllStations();
      setStations(data);
    } catch (error) {
      console.error("Error loading stations:", error);
    } finally {
      setLoading(false);
    }
  };
  loadStations();
}, []);
```

### StationDetail.jsx

**Hiện tại:**

```javascript
import stations from "../data/stations";
const station = stations.find((s) => s.id === id);
```

**Sau khi migrate:**

```javascript
import { fetchStationById } from "../api/stations";

const [station, setStation] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadStation = async () => {
    try {
      const data = await fetchStationById(id);
      setStation(data);
    } catch (error) {
      console.error("Error loading station:", error);
    } finally {
      setLoading(false);
    }
  };
  loadStation();
}, [id]);
```

### BookingForm.jsx

**Hiện tại:**

```javascript
import stations from "../data/stations";
// Sử dụng trực tiếp: stations.map(...)
```

**Sau khi migrate:**

```javascript
import { fetchAllStations } from "../api/stations";

const [stations, setStations] = useState([]);

useEffect(() => {
  const loadStations = async () => {
    const data = await fetchAllStations();
    setStations(data);
  };
  loadStations();
}, []);
```

### Vehicles.jsx

**Hiện tại:**

```javascript
import vehicles from "../data/vehicles";
const [allVehicles] = useState(vehicles);
```

**Sau khi migrate:**

```javascript
// TODO: Cần tạo API endpoint GET /api/EVBike/GetAllBikes
// import { getAllBikes } from "../api/bikes";

const [allVehicles, setAllVehicles] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadVehicles = async () => {
    try {
      const data = await getAllBikes();
      setAllVehicles(data);
    } catch (error) {
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };
  loadVehicles();
}, []);
```

### ProductDetail.jsx

**Hiện tại:**

```javascript
import vehicles from "../data/vehicles";
const vehicle = vehicles.find((v) => v.id === id);
```

**Sau khi migrate:**

```javascript
import { getBikeById } from "../api/bikes";

const [vehicle, setVehicle] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadVehicle = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await getBikeById(id, token);
      setVehicle(data);
    } catch (error) {
      console.error("Error loading vehicle:", error);
    } finally {
      setLoading(false);
    }
  };
  loadVehicle();
}, [id]);
```

## ⚠️ API ENDPOINTS THIẾU (Cần Backend hỗ trợ)

### EVBikeController.cs cần thêm:

```csharp
[HttpGet("GetAllBikes")]
public async Task<ActionResult<IEnumerable<EVBike>>> GetAllBikes()
{
    var bikes = await _evBikeService.GetAllAsync();
    return Ok(bikes);
}
```

## 📝 Checklist Migration

- [ ] Tạo API endpoint `GetAllBikes` ở backend
- [ ] Thêm function `getAllBikes()` vào `src/api/bikes.js`
- [ ] Migrate `Home.jsx` sang API
- [ ] Migrate `Stations.jsx` sang API
- [ ] Migrate `StationDetail.jsx` sang API
- [ ] Migrate `BookingForm.jsx` sang API
- [ ] Migrate `StationFinder.jsx` sang API
- [ ] Migrate `Vehicles.jsx` sang API
- [ ] Migrate `ProductDetail.jsx` sang API
- [ ] Test toàn bộ flow với real data
- [ ] Xóa `src/data/stations.js`
- [ ] Xóa `src/data/vehicles.js`

## 🎯 Ưu tiên

1. **HIGH**: Backend tạo endpoint `GetAllBikes`
2. **HIGH**: Migrate các trang chính (Home, Stations, Vehicles)
3. **MEDIUM**: Migrate các component (BookingForm, StationFinder)
4. **LOW**: Cleanup mock data files

## 💡 Lưu ý

- Tất cả API calls cần xử lý loading state
- Cần xử lý error cases (network error, 404, 500)
- Mock data ID format: "s1", "v1" vs Database ID: 1, 2, 3
- Một số API yêu cầu JWT token (đã login)
- Cần mapping giữa frontend field names và backend DTO properties
