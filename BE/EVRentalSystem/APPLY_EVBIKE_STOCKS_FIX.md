# ? FIX APPLIED - EVBike_Stocks Foreign Key Issue

## Problem Resolved
The shadow column `EVBikeBikeID` has been replaced with the correct `BikeID` foreign key.

---

## ?? What Was Fixed

### 1. Created New Migration
**File:** `Repositories/Migrations/20251026081500_Fix_EVBikeStocks_ForeignKey_BikeID.cs`

This migration will:
- ? Drop the incorrect `FK_EVBike_Stocks_EVBikes_EVBikeBikeID` constraint
- ? Drop the shadow column `EVBikeBikeID`
- ? Create correct `FK_EVBike_Stocks_EVBikes_BikeID` constraint using `BikeID`
- ? Change delete behavior from Cascade to Restrict for both foreign keys

### 2. Updated Model Snapshot
**File:** `Repositories/Migrations/EVRenterDBContextModelSnapshot.cs`
- Removed `EVBikeBikeID` property
- Fixed foreign key configuration to use `BikeID`

### 3. DbContext Already Configured
**File:** `Repositories/DBContext/EVRenterDBContext.cs`
- Foreign key configuration already in place

---

## ?? Apply the Fix

### Option 1: Using Package Manager Console (Recommended)

```powershell
# Navigate to the Repositories project directory
cd D:\Github_Projects\EV_Station_based_Rental_System\BE\EVRentalSystem\Repositories

# Apply the migration
Update-Database
```

### Option 2: Using .NET CLI

```bash
# Navigate to solution directory
cd D:\Github_Projects\EV_Station_based_Rental_System\BE\EVRentalSystem

# Apply migration
dotnet ef database update --project Repositories --startup-project API
```

### Option 3: Using SQL Script (For Production)

```powershell
# Generate SQL script
Script-Migration -From 20251026080850_Fix_Rental_Station_EVBike_Add_EVBikeStocks -To 20251026081500_Fix_EVBikeStocks_ForeignKey_BikeID

# Or with .NET CLI
dotnet ef migrations script 20251026080850_Fix_Rental_Station_EVBike_Add_EVBikeStocks 20251026081500_Fix_EVBikeStocks_ForeignKey_BikeID -o fix_fk.sql --project Repositories --startup-project API
```

---

## ? Verification Steps

### 1. After Migration
Check that the migration applied successfully:

```sql
-- Check foreign keys on EVBike_Stocks table
SELECT 
    fk.name AS ForeignKeyName,
    COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
    COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fkc 
    ON fk.object_id = fkc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) = 'EVBike_Stocks'
```

**Expected Output:**
```
ForeignKeyName                            ColumnName      ReferencedTable   ReferencedColumn
----------------------------------------- --------------- ----------------- ----------------
FK_EVBike_Stocks_EVBikes_BikeID          BikeID          EVBikes           BikeID
FK_EVBike_Stocks_Stations_StationID      StationID       Stations          StationID
```

### 2. Verify No Shadow Column
```sql
-- Check columns in EVBike_Stocks table
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'EVBike_Stocks'
ORDER BY ORDINAL_POSITION
```

**Should NOT see:** `EVBikeBikeID`

**Should see:**
- StockID
- BikeID (FK to EVBikes)
- Color
- StationID (FK to Stations)
- LicensePlate
- Status
- CreatedAt
- UpdatedAt

---

## ?? Test the Fix

After migration, test creating a stock:

```csharp
// Test with API endpoint or direct service call
var testStock = new EVBike_Stocks
{
    BikeID = 1,              // Must exist in EVBikes
    StationID = 1,           // Must exist in Stations
    Color = 1,
    LicensePlate = "29A-12345",
    Status = 1,
    CreatedAt = DateTime.Now,
    UpdatedAt = DateTime.Now
};

// This should now work without FK constraint error
await _stocksService.AddAsync(testStock);
```

**Test via API:**
```http
POST /api/EVBikeStocks/CreateStock
Authorization: Bearer {token}
Content-Type: application/json

{
  "bikeID": 1,
  "color": 1,
  "stationID": 1,
  "licensePlate": "29A-12345",
  "status": 1
}
```

---

## ?? Migration Details

### Before Fix:
```
EVBike_Stocks Table:
- StockID (PK)
- BikeID (not used as FK!)
- EVBikeBikeID (shadow FK) ? WRONG
- StationID (FK)
- ...
```

### After Fix:
```
EVBike_Stocks Table:
- StockID (PK)
- BikeID (FK to EVBikes.BikeID) ? CORRECT
- StationID (FK to Stations.StationID) ? CORRECT
- ...
```

---

## ?? Important Notes

1. **Data Preservation**: The migration preserves existing data (if any)
2. **Referential Integrity**: `DeleteBehavior.Restrict` prevents accidental deletions
3. **Unique Constraint**: LicensePlate remains unique
4. **No Code Changes Needed**: Your model and DTOs remain the same

---

## ?? If Migration Fails

If you encounter issues:

### Option A: Start Fresh (Development Only)
```powershell
# Drop database
Drop-Database

# Remove this migration if needed
Remove-Migration

# Recreate and apply all migrations
Add-Migration InitialCreate
Update-Database
```

### Option B: Manual SQL Fix
```sql
-- 1. Drop incorrect FK
ALTER TABLE EVBike_Stocks 
DROP CONSTRAINT FK_EVBike_Stocks_EVBikes_EVBikeBikeID;

-- 2. Drop shadow column
ALTER TABLE EVBike_Stocks 
DROP COLUMN EVBikeBikeID;

-- 3. Create correct FK
ALTER TABLE EVBike_Stocks
ADD CONSTRAINT FK_EVBike_Stocks_EVBikes_BikeID
FOREIGN KEY (BikeID) REFERENCES EVBikes(BikeID);

-- 4. Update Station FK to Restrict
ALTER TABLE EVBike_Stocks 
DROP CONSTRAINT FK_EVBike_Stocks_Stations_StationID;

ALTER TABLE EVBike_Stocks
ADD CONSTRAINT FK_EVBike_Stocks_Stations_StationID
FOREIGN KEY (StationID) REFERENCES Stations(StationID);
```

---

## ? Build Status

? **Code compiles successfully**
? **Migration file created**
? **Snapshot updated**
? **Pending: Apply migration to database**

---

## ?? Next Steps

1. ? Apply the migration (see options above)
2. ? Verify foreign keys are correct
3. ? Test creating a stock via API
4. ? Ready to use EVBike_Stocks CRUD!

---

**After applying the migration, the FK constraint error will be completely resolved!** ??
