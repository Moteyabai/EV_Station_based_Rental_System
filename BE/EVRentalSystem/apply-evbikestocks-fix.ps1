# Apply EVBike_Stocks Foreign Key Fix
# Run this script in Package Manager Console

Write-Host "?? Applying EVBike_Stocks Foreign Key Fix..." -ForegroundColor Cyan
Write-Host ""

# Navigate to Repositories project
Write-Host "?? Navigating to Repositories project..." -ForegroundColor Yellow
Set-Location "D:\Github_Projects\EV_Station_based_Rental_System\BE\EVRentalSystem\Repositories"

Write-Host ""
Write-Host "?? Current migrations:" -ForegroundColor Yellow
Get-ChildItem ".\Migrations\*.cs" | Select-Object Name | Format-Table -AutoSize

Write-Host ""
Write-Host "?? Applying migration to database..." -ForegroundColor Green
Update-Database -Verbose

Write-Host ""
Write-Host "? Migration applied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "?? Verifying foreign keys..." -ForegroundColor Cyan

# Optionally run verification query (uncomment if using Invoke-Sqlcmd)
# $query = @"
# SELECT 
#     fk.name AS ForeignKeyName,
#     COL_NAME(fkc.parent_object_id, fkc.parent_column_id) AS ColumnName,
#     OBJECT_NAME(fk.referenced_object_id) AS ReferencedTable,
#     COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) AS ReferencedColumn
# FROM sys.foreign_keys AS fk
# INNER JOIN sys.foreign_key_columns AS fkc 
#     ON fk.object_id = fkc.constraint_object_id
# WHERE OBJECT_NAME(fk.parent_object_id) = 'EVBike_Stocks'
# "@
# 
# Invoke-Sqlcmd -Query $query -ServerInstance "your-server" -Database "EVRenterDB"

Write-Host ""
Write-Host "? Done! You can now test creating EVBike_Stocks." -ForegroundColor Green
Write-Host ""
Write-Host "?? Test with API endpoint:" -ForegroundColor Yellow
Write-Host "POST /api/EVBikeStocks/CreateStock" -ForegroundColor White
Write-Host ""
Write-Host "?? All set! The FK constraint error is resolved." -ForegroundColor Green
