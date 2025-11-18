using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Add_Latitute_Longtitute_Station : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExteriorImageUrl",
                table: "Stations");

            migrationBuilder.DropColumn(
                name: "ThumbnailImageUrl",
                table: "Stations");

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "Stations",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "Stations",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Stations");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Stations");

            migrationBuilder.AddColumn<string>(
                name: "ExteriorImageUrl",
                table: "Stations",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ThumbnailImageUrl",
                table: "Stations",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");
        }
    }
}
