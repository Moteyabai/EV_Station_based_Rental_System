using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Fix_Rental_Station_EVBike_Add_EVBikeStocks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EVBikes_Stations_StationID",
                table: "EVBikes");

            migrationBuilder.DropIndex(
                name: "IX_EVBikes_StationID",
                table: "EVBikes");

            migrationBuilder.DropColumn(
                name: "BatteryCapacity",
                table: "EVBikes");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "EVBikes");

            migrationBuilder.DropColumn(
                name: "LicensePlate",
                table: "EVBikes");

            migrationBuilder.DropColumn(
                name: "StationID",
                table: "EVBikes");

            migrationBuilder.AddColumn<string>(
                name: "LicensePlate",
                table: "Rentals",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "EVBikes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "EVBike_Stocks",
                columns: table => new
                {
                    StockID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BikeID = table.Column<int>(type: "int", nullable: false),
                    Color = table.Column<int>(type: "int", nullable: false),
                    StationID = table.Column<int>(type: "int", nullable: false),
                    LicensePlate = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EVBikeBikeID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EVBike_Stocks", x => x.StockID);
                    table.ForeignKey(
                        name: "FK_EVBike_Stocks_EVBikes_EVBikeBikeID",
                        column: x => x.EVBikeBikeID,
                        principalTable: "EVBikes",
                        principalColumn: "BikeID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EVBike_Stocks_Stations_StationID",
                        column: x => x.StationID,
                        principalTable: "Stations",
                        principalColumn: "StationID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EVBike_Stocks_EVBikeBikeID",
                table: "EVBike_Stocks",
                column: "EVBikeBikeID");

            migrationBuilder.CreateIndex(
                name: "IX_EVBike_Stocks_LicensePlate",
                table: "EVBike_Stocks",
                column: "LicensePlate",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EVBike_Stocks_StationID",
                table: "EVBike_Stocks",
                column: "StationID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EVBike_Stocks");

            migrationBuilder.DropColumn(
                name: "LicensePlate",
                table: "Rentals");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "EVBikes");

            migrationBuilder.AddColumn<string>(
                name: "BatteryCapacity",
                table: "EVBikes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "EVBikes",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LicensePlate",
                table: "EVBikes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "StationID",
                table: "EVBikes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EVBikes_StationID",
                table: "EVBikes",
                column: "StationID");

            migrationBuilder.AddForeignKey(
                name: "FK_EVBikes_Stations_StationID",
                table: "EVBikes",
                column: "StationID",
                principalTable: "Stations",
                principalColumn: "StationID");
        }
    }
}