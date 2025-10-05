using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Add_IDDocument_table : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Avatar",
                table: "Accounts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "IDDocuments",
                columns: table => new
                {
                    DocumentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountID = table.Column<int>(type: "int", nullable: false),
                    VerifiedByStaffID = table.Column<int>(type: "int", nullable: false),
                    IDCardFront = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IDCardBack = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LicenseCardFront = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LicenseCardBack = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    Feedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IDDocuments", x => x.DocumentID);
                    table.ForeignKey(
                        name: "FK_IDDocuments_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_IDDocuments_Accounts_VerifiedByStaffID",
                        column: x => x.VerifiedByStaffID,
                        principalTable: "Accounts",
                        principalColumn: "AccountId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IDDocuments_AccountID",
                table: "IDDocuments",
                column: "AccountID");

            migrationBuilder.CreateIndex(
                name: "IX_IDDocuments_VerifiedByStaffID",
                table: "IDDocuments",
                column: "VerifiedByStaffID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "IDDocuments");

            migrationBuilder.DropColumn(
                name: "Avatar",
                table: "Accounts");
        }
    }
}