using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Add_EVBike_Brand_Station_Tables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StationID",
                table: "Accounts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalRental",
                table: "Accounts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalSpent",
                table: "Accounts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Brands",
                columns: table => new
                {
                    BrandID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BrandName = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Brands", x => x.BrandID);
                });

            migrationBuilder.CreateTable(
                name: "Stations",
                columns: table => new
                {
                    StationID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    OpeningHours = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContactNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ExteriorImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ChargersImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ThumbnailImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stations", x => x.StationID);
                });

            migrationBuilder.CreateTable(
                name: "EVBikes",
                columns: table => new
                {
                    BikeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BikeName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BikeType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LicensePlate = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BrandID = table.Column<int>(type: "int", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    YearOfManufacture = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BatteryCapacity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PricePerDay = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StationID = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EVBikes", x => x.BikeID);
                    table.ForeignKey(
                        name: "FK_EVBikes_Brands_BrandID",
                        column: x => x.BrandID,
                        principalTable: "Brands",
                        principalColumn: "BrandID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EVBikes_Stations_StationID",
                        column: x => x.StationID,
                        principalTable: "Stations",
                        principalColumn: "StationID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_StationID",
                table: "Accounts",
                column: "StationID");

            migrationBuilder.CreateIndex(
                name: "IX_EVBikes_BrandID",
                table: "EVBikes",
                column: "BrandID");

            migrationBuilder.CreateIndex(
                name: "IX_EVBikes_StationID",
                table: "EVBikes",
                column: "StationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Stations_StationID",
                table: "Accounts",
                column: "StationID",
                principalTable: "Stations",
                principalColumn: "StationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Stations_StationID",
                table: "Accounts");

            migrationBuilder.DropTable(
                name: "EVBikes");

            migrationBuilder.DropTable(
                name: "Brands");

            migrationBuilder.DropTable(
                name: "Stations");

            migrationBuilder.DropIndex(
                name: "IX_Accounts_StationID",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "StationID",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "TotalRental",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "TotalSpent",
                table: "Accounts");
        }
    }
}