using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Latest_Fix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EVBike_Stocks_EVBikes_EVBikeBikeID",
                table: "EVBike_Stocks");

            migrationBuilder.DropIndex(
                name: "IX_EVBike_Stocks_EVBikeBikeID",
                table: "EVBike_Stocks");

            migrationBuilder.DropColumn(
                name: "EVBikeBikeID",
                table: "EVBike_Stocks");

            migrationBuilder.CreateIndex(
                name: "IX_EVBike_Stocks_BikeID",
                table: "EVBike_Stocks",
                column: "BikeID");

            migrationBuilder.AddForeignKey(
                name: "FK_EVBike_Stocks_EVBikes_BikeID",
                table: "EVBike_Stocks",
                column: "BikeID",
                principalTable: "EVBikes",
                principalColumn: "BikeID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EVBike_Stocks_EVBikes_BikeID",
                table: "EVBike_Stocks");

            migrationBuilder.DropIndex(
                name: "IX_EVBike_Stocks_BikeID",
                table: "EVBike_Stocks");

            migrationBuilder.AddColumn<int>(
                name: "EVBikeBikeID",
                table: "EVBike_Stocks",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_EVBike_Stocks_EVBikeBikeID",
                table: "EVBike_Stocks",
                column: "EVBikeBikeID");

            migrationBuilder.AddForeignKey(
                name: "FK_EVBike_Stocks_EVBikes_EVBikeBikeID",
                table: "EVBike_Stocks",
                column: "EVBikeBikeID",
                principalTable: "EVBikes",
                principalColumn: "BikeID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}