# ⚠️ BACKEND ERROR - Cần Fix Ngay

## 🔴 Lỗi hiện tại:

```
500 Internal Server Error
Cannot access a disposed context instance.
A common cause of this error is disposing a context instance that was resolved from dependency injection
and then later trying to use the same context instance elsewhere in your application.
Object name: 'EVRenterDBContext'.
```

**API gặp lỗi:** `POST /api/Payment/CreatePayment`

---

## 🔍 Nguyên nhân:

Lỗi **Dependency Injection** trong .NET - DbContext bị dispose (giải phóng) trước khi sử dụng xong.

**Các trường hợp phổ biến:**

### 1. Dispose DbContext thủ công

```csharp
// ❌ SAI - Không được dispose thủ công
public async Task<IActionResult> CreatePayment([FromBody] PaymentCreateDTO dto)
{
    using (var context = new EVRenterDBContext()) // SAI!
    {
        // ...
    }
}
```

### 2. Inject DbContext sai cách

```csharp
// ❌ SAI
private EVRenterDBContext _context;

public PaymentController()
{
    _context = new EVRenterDBContext(); // SAI!
}
```

### 3. Service/Repository dispose context

```csharp
// ❌ SAI
public class PaymentRepository
{
    public async Task AddAsync(Payment payment)
    {
        using (var context = _context) // SAI!
        {
            await context.Payments.AddAsync(payment);
            await context.SaveChangesAsync();
        }
    }
}
```

---

## ✅ GIẢI PHÁP:

### 1. Fix PaymentController.cs

**Kiểm tra constructor:**

```csharp
public class PaymentController : ControllerBase
{
    private readonly PaymentService _paymentService;
    private readonly RenterService _renterService;
    // ... other services

    // ✅ ĐÚNG - Inject qua DI
    public PaymentController(
        PaymentService paymentService,
        RenterService renterService,
        // ... other services
    )
    {
        _paymentService = paymentService;
        _renterService = renterService;
        // ... assign other services
    }

    [HttpPost("CreatePayment")]
    public async Task<IActionResult> CreatePayment([FromBody] PaymentCreateDTO dto)
    {
        // ✅ ĐÚNG - Không dispose thủ công
        // Service sẽ tự động dispose khi request kết thúc

        var payment = new Payment
        {
            AccountID = dto.AccountID,
            Amount = dto.Amount,
            BikeID = dto.BikeID,
            StationID = dto.StationID,
            PaymentMethod = dto.PaymentMethod,
            PaymentType = dto.PaymentType,
            Status = dto.Status,
            CreatedAt = DateTime.Now
        };

        await _paymentService.AddAsync(payment);

        // Create PayOS payment link
        var paymentLink = await _paymentService.CreatePaymentLink(...);

        return Ok(new { paymentUrl = paymentLink });
    }
}
```

---

### 2. Fix PaymentService.cs

**Kiểm tra constructor và methods:**

```csharp
public class PaymentService : IBaseService<Payment>
{
    private readonly PaymentRepository _paymentRepository;
    private readonly IConfiguration _configuration;
    private readonly PayOS _payOS;

    // ✅ ĐÚNG - Inject repository
    public PaymentService(IConfiguration configuration)
    {
        _paymentRepository = PaymentRepository.Instance;
        _configuration = configuration;

        // Initialize PayOS
        PayOSSettings payOS = new PayOSSettings()
        {
            ClientId = _configuration.GetValue<string>("PayOS:PAYOS_CLIENT_ID"),
            ApiKey = _configuration.GetValue<string>("PayOS:PAYOS_API_KEY"),
            ChecksumKey = _configuration.GetValue<string>("PayOS:PAYOS_CHECKSUM_KEY")
        };
        _payOS = new PayOS(payOS.ClientId, payOS.ApiKey, payOS.ChecksumKey);
    }

    // ✅ ĐÚNG - Không dispose context
    public async Task AddAsync(Payment entity)
    {
        await _paymentRepository.AddAsync(entity);
        // Repository sẽ tự động dispose context
    }

    public async Task<string> CreatePaymentLink(CreatePaymentLinkRequest body)
    {
        // ✅ ĐÚNG - Chỉ gọi PayOS API, không touch database
        PaymentData paymentData = new PaymentData(...);
        CreatePaymentResult createPayment = await _payOS.createPaymentLink(paymentData);

        if (createPayment == null || string.IsNullOrEmpty(createPayment.checkoutUrl))
        {
            throw new Exception("Tạo link thanh toán thất bại!");
        }

        return createPayment.checkoutUrl;
    }
}
```

---

### 3. Fix PaymentRepository.cs

**Kiểm tra DbContext usage:**

```csharp
public class PaymentRepository
{
    private readonly EVRenterDBContext _context;

    // ✅ ĐÚNG - Singleton hoặc DI
    private static PaymentRepository _instance;
    public static PaymentRepository Instance
    {
        get
        {
            if (_instance == null)
            {
                _instance = new PaymentRepository();
            }
            return _instance;
        }
    }

    private PaymentRepository()
    {
        _context = new EVRenterDBContext();
    }

    // ✅ ĐÚNG - Không dispose context trong method
    public async Task AddAsync(Payment payment)
    {
        // ❌ KHÔNG LÀM THẾ NÀY:
        // using (var context = _context) { ... }

        // ✅ LÀM THẾ NÀY:
        await _context.Payments.AddAsync(payment);
        await _context.SaveChangesAsync();
    }

    public async Task<Payment> GetByIdAsync(int id)
    {
        return await _context.Payments.FindAsync(id);
    }
}
```

---

### 4. Fix Program.cs / Startup.cs

**Đảm bảo DbContext được register đúng:**

```csharp
// Program.cs hoặc Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // ✅ ĐÚNG - Register DbContext với DI
    services.AddDbContext<EVRenterDBContext>(options =>
        options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));

    // ✅ Register Services với Scoped lifetime
    services.AddScoped<PaymentService>();
    services.AddScoped<RenterService>();
    services.AddScoped<RentalService>();
    // ... other services

    services.AddControllers();
}
```

---

## 🔧 QUICK FIX - Kiểm tra ngay:

### Bước 1: Tìm tất cả chỗ có `using`

```bash
# Tìm trong PaymentController.cs
grep -n "using.*context" PaymentController.cs

# Tìm trong PaymentService.cs
grep -n "using.*context" PaymentService.cs

# Tìm trong PaymentRepository.cs
grep -n "using.*context" PaymentRepository.cs
```

### Bước 2: Xóa tất cả `using` statement với DbContext

```csharp
// ❌ XÓA BỎ:
using (var context = _context)
{
    // ...
}

// ❌ XÓA BỎ:
using (var db = new EVRenterDBContext())
{
    // ...
}
```

### Bước 3: Check Dispose() calls

```csharp
// ❌ XÓA BỎ:
_context.Dispose();

// ❌ XÓA BỎ:
context.Dispose();
```

### Bước 4: Restart Backend

```bash
# Stop backend
Ctrl+C

# Rebuild
dotnet clean
dotnet build

# Run again
dotnet run
```

---

## 📋 CHECKLIST:

- [ ] Không có `using (var context = ...)` trong Controllers
- [ ] Không có `using (var context = ...)` trong Services
- [ ] Không có `using (var context = ...)` trong Repositories
- [ ] Không có `context.Dispose()` calls
- [ ] DbContext được inject qua DI (Dependency Injection)
- [ ] Services được register với `AddScoped` hoặc `AddTransient`
- [ ] Rebuild và restart backend

---

## 🧪 Test sau khi fix:

1. Rebuild backend
2. Start backend
3. Frontend: Checkout với PayOS
4. Check console - không còn lỗi 500
5. Payment link được tạo thành công

---

## 📞 Nếu vẫn lỗi:

Share code của các files này:

1. `PaymentController.cs` (full file)
2. `PaymentService.cs` (full file)
3. `PaymentRepository.cs` (full file)
4. `Program.cs` hoặc `Startup.cs` (phần ConfigureServices)

---

**LƯU Ý:** Đây là lỗi **BACKEND**, không phải Frontend. Frontend đang gửi data đúng format rồi.
