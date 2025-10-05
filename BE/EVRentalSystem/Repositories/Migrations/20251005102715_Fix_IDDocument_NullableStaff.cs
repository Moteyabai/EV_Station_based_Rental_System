using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Fix_IDDocument_NullableStaff : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IDDocuments_Accounts_VerifiedByStaffID",
                table: "IDDocuments");

            migrationBuilder.AlterColumn<int>(
                name: "VerifiedByStaffID",
                table: "IDDocuments",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_IDDocuments_Accounts_VerifiedByStaffID",
                table: "IDDocuments",
                column: "VerifiedByStaffID",
                principalTable: "Accounts",
                principalColumn: "AccountId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IDDocuments_Accounts_VerifiedByStaffID",
                table: "IDDocuments");

            migrationBuilder.AlterColumn<int>(
                name: "VerifiedByStaffID",
                table: "IDDocuments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_IDDocuments_Accounts_VerifiedByStaffID",
                table: "IDDocuments",
                column: "VerifiedByStaffID",
                principalTable: "Accounts",
                principalColumn: "AccountId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}