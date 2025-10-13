using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Repositories.Migrations
{
    /// <inheritdoc />
    public partial class Add_Renter_Staff_Rental_FeedBack_Payment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Accounts_Stations_StationID",
                table: "Accounts");

            migrationBuilder.DropForeignKey(
                name: "FK_IDDocuments_Accounts_AccountID",
                table: "IDDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_IDDocuments_Accounts_VerifiedByStaffID",
                table: "IDDocuments");

            migrationBuilder.DropIndex(
                name: "IX_IDDocuments_AccountID",
                table: "IDDocuments");

            migrationBuilder.DropIndex(
                name: "IX_Accounts_StationID",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "ChargersImageUrl",
                table: "Stations");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "EVBikes");

            migrationBuilder.DropColumn(
                name: "StationID",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "TotalRental",
                table: "Accounts");

            migrationBuilder.DropColumn(
                name: "TotalSpent",
                table: "Accounts");

            migrationBuilder.RenameColumn(
                name: "Capacity",
                table: "Stations",
                newName: "BikeCapacity");

            migrationBuilder.RenameColumn(
                name: "Feedback",
                table: "IDDocuments",
                newName: "Note");

            migrationBuilder.RenameColumn(
                name: "AccountID",
                table: "IDDocuments",
                newName: "RenterID");

            migrationBuilder.CreateTable(
                name: "Renters",
                columns: table => new
                {
                    RenterID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountID = table.Column<int>(type: "int", nullable: false),
                    DocumentID = table.Column<int>(type: "int", nullable: true),
                    TotalRental = table.Column<int>(type: "int", nullable: false),
                    TotalSpent = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Renters", x => x.RenterID);
                    table.ForeignKey(
                        name: "FK_Renters_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StationStaffs",
                columns: table => new
                {
                    StaffID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StationID = table.Column<int>(type: "int", nullable: true),
                    AccountID = table.Column<int>(type: "int", nullable: false),
                    HandoverTimes = table.Column<int>(type: "int", nullable: false),
                    ReceiveTimes = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StationStaffs", x => x.StaffID);
                    table.ForeignKey(
                        name: "FK_StationStaffs_Accounts_AccountID",
                        column: x => x.AccountID,
                        principalTable: "Accounts",
                        principalColumn: "AccountId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StationStaffs_Stations_StationID",
                        column: x => x.StationID,
                        principalTable: "Stations",
                        principalColumn: "StationID");
                });

            migrationBuilder.CreateTable(
                name: "Feedbacks",
                columns: table => new
                {
                    FeedbackID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RenterID = table.Column<int>(type: "int", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedbacks", x => x.FeedbackID);
                    table.ForeignKey(
                        name: "FK_Feedbacks_Renters_RenterID",
                        column: x => x.RenterID,
                        principalTable: "Renters",
                        principalColumn: "RenterID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Rentals",
                columns: table => new
                {
                    RentalID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BikeID = table.Column<int>(type: "int", nullable: false),
                    RenterID = table.Column<int>(type: "int", nullable: false),
                    StationID = table.Column<int>(type: "int", nullable: false),
                    AssignedStaff = table.Column<int>(type: "int", nullable: true),
                    InitialBattery = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    FinalBattery = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InitBikeCondition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FinalBikeCondition = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RentalDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReservedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReturnDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Deposit = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Fee = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Rentals", x => x.RentalID);
                    table.ForeignKey(
                        name: "FK_Rentals_EVBikes_BikeID",
                        column: x => x.BikeID,
                        principalTable: "EVBikes",
                        principalColumn: "BikeID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Rentals_Renters_RenterID",
                        column: x => x.RenterID,
                        principalTable: "Renters",
                        principalColumn: "RenterID",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Rentals_StationStaffs_AssignedStaff",
                        column: x => x.AssignedStaff,
                        principalTable: "StationStaffs",
                        principalColumn: "StaffID");
                    table.ForeignKey(
                        name: "FK_Rentals_Stations_StationID",
                        column: x => x.StationID,
                        principalTable: "Stations",
                        principalColumn: "StationID",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_IDDocuments_RenterID",
                table: "IDDocuments",
                column: "RenterID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Feedbacks_RenterID",
                table: "Feedbacks",
                column: "RenterID");

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_AssignedStaff",
                table: "Rentals",
                column: "AssignedStaff");

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_BikeID",
                table: "Rentals",
                column: "BikeID");

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_RenterID",
                table: "Rentals",
                column: "RenterID");

            migrationBuilder.CreateIndex(
                name: "IX_Rentals_StationID",
                table: "Rentals",
                column: "StationID");

            migrationBuilder.CreateIndex(
                name: "IX_Renters_AccountID",
                table: "Renters",
                column: "AccountID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StationStaffs_AccountID",
                table: "StationStaffs",
                column: "AccountID",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StationStaffs_StationID",
                table: "StationStaffs",
                column: "StationID");

            migrationBuilder.AddForeignKey(
                name: "FK_IDDocuments_Renters_RenterID",
                table: "IDDocuments",
                column: "RenterID",
                principalTable: "Renters",
                principalColumn: "RenterID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_IDDocuments_StationStaffs_VerifiedByStaffID",
                table: "IDDocuments",
                column: "VerifiedByStaffID",
                principalTable: "StationStaffs",
                principalColumn: "StaffID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_IDDocuments_Renters_RenterID",
                table: "IDDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_IDDocuments_StationStaffs_VerifiedByStaffID",
                table: "IDDocuments");

            migrationBuilder.DropTable(
                name: "Feedbacks");

            migrationBuilder.DropTable(
                name: "Rentals");

            migrationBuilder.DropTable(
                name: "Renters");

            migrationBuilder.DropTable(
                name: "StationStaffs");

            migrationBuilder.DropIndex(
                name: "IX_IDDocuments_RenterID",
                table: "IDDocuments");

            migrationBuilder.RenameColumn(
                name: "BikeCapacity",
                table: "Stations",
                newName: "Capacity");

            migrationBuilder.RenameColumn(
                name: "RenterID",
                table: "IDDocuments",
                newName: "AccountID");

            migrationBuilder.RenameColumn(
                name: "Note",
                table: "IDDocuments",
                newName: "Feedback");

            migrationBuilder.AddColumn<string>(
                name: "ChargersImageUrl",
                table: "Stations",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Quantity",
                table: "EVBikes",
                type: "int",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.CreateIndex(
                name: "IX_IDDocuments_AccountID",
                table: "IDDocuments",
                column: "AccountID");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_StationID",
                table: "Accounts",
                column: "StationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Accounts_Stations_StationID",
                table: "Accounts",
                column: "StationID",
                principalTable: "Stations",
                principalColumn: "StationID");

            migrationBuilder.AddForeignKey(
                name: "FK_IDDocuments_Accounts_AccountID",
                table: "IDDocuments",
                column: "AccountID",
                principalTable: "Accounts",
                principalColumn: "AccountId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_IDDocuments_Accounts_VerifiedByStaffID",
                table: "IDDocuments",
                column: "VerifiedByStaffID",
                principalTable: "Accounts",
                principalColumn: "AccountId");
        }
    }
}
