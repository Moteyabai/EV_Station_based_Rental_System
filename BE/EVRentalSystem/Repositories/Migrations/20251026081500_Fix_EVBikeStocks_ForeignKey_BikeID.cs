using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Fix_EVBikeStocks_ForeignKey_BikeID : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the incorrect foreign key and index
            migrationBuilder.DropForeignKey(
                name: "FK_EVBike_Stocks_EVBikes_EVBikeBikeID",
                table: "EVBike_Stocks");

            migrationBuilder.DropIndex(
                name: "IX_EVBike_Stocks_EVBikeBikeID",
                table: "EVBike_Stocks");

            // Drop the shadow column
            migrationBuilder.DropColumn(
                name: "EVBikeBikeID",
                table: "EVBike_Stocks");

            // Create index on the correct BikeID column
            migrationBuilder.CreateIndex(
                name: "IX_EVBike_Stocks_BikeID",
                table: "EVBike_Stocks",
                column: "BikeID");

            // Create the correct foreign key using BikeID
            migrationBuilder.AddForeignKey(
                name: "FK_EVBike_Stocks_EVBikes_BikeID",
                table: "EVBike_Stocks",
                column: "BikeID",
                principalTable: "EVBikes",
                principalColumn: "BikeID",
                onDelete: ReferentialAction.Restrict);

            // Update the Station foreign key to use Restrict instead of Cascade
            migrationBuilder.DropForeignKey(
                name: "FK_EVBike_Stocks_Stations_StationID",
                table: "EVBike_Stocks");

            migrationBuilder.AddForeignKey(
                name: "FK_EVBike_Stocks_Stations_StationID",
                table: "EVBike_Stocks",
                column: "StationID",
                principalTable: "Stations",
                principalColumn: "StationID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop the correct foreign keys
            migrationBuilder.DropForeignKey(
                name: "FK_EVBike_Stocks_EVBikes_BikeID",
                table: "EVBike_Stocks");

            migrationBuilder.DropForeignKey(
                name: "FK_EVBike_Stocks_Stations_StationID",
                table: "EVBike_Stocks");

            migrationBuilder.DropIndex(
                name: "IX_EVBike_Stocks_BikeID",
                table: "EVBike_Stocks");

            // Re-create the shadow column
            migrationBuilder.AddColumn<int>(
                name: "EVBikeBikeID",
                table: "EVBike_Stocks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Re-create the incorrect index
            migrationBuilder.CreateIndex(
                name: "IX_EVBike_Stocks_EVBikeBikeID",
                table: "EVBike_Stocks",
                column: "EVBikeBikeID");

            // Re-create the incorrect foreign key
            migrationBuilder.AddForeignKey(
                name: "FK_EVBike_Stocks_EVBikes_EVBikeBikeID",
                table: "EVBike_Stocks",
                column: "EVBikeBikeID",
                principalTable: "EVBikes",
                principalColumn: "BikeID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EVBike_Stocks_Stations_StationID",
                table: "EVBike_Stocks",
                column: "StationID",
                principalTable: "Stations",
                principalColumn: "StationID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}