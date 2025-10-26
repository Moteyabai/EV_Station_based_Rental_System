using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Fix_IDDocument_Renter : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IDDocuments_Renters_RenterID",
                table: "IDDocuments");

            migrationBuilder.DropIndex(
                name: "IX_IDDocuments_RenterID",
                table: "IDDocuments");

            migrationBuilder.DropColumn(
                name: "RenterID",
                table: "IDDocuments");

            migrationBuilder.CreateIndex(
                name: "IX_Renters_DocumentID",
                table: "Renters",
                column: "DocumentID",
                unique: true,
                filter: "[DocumentID] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Renters_IDDocuments_DocumentID",
                table: "Renters",
                column: "DocumentID",
                principalTable: "IDDocuments",
                principalColumn: "DocumentID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Renters_IDDocuments_DocumentID",
                table: "Renters");

            migrationBuilder.DropIndex(
                name: "IX_Renters_DocumentID",
                table: "Renters");

            migrationBuilder.AddColumn<int>(
                name: "RenterID",
                table: "IDDocuments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_IDDocuments_RenterID",
                table: "IDDocuments",
                column: "RenterID",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_IDDocuments_Renters_RenterID",
                table: "IDDocuments",
                column: "RenterID",
                principalTable: "Renters",
                principalColumn: "RenterID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}