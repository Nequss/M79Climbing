using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace M79Climbing.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePlayerStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Ip",
                table: "PlayerStats",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "PlayerStats",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Ip",
                table: "PlayerStats");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "PlayerStats");
        }
    }
}
