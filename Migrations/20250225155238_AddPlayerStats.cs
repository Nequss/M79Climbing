using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace M79Climbing.Migrations
{
    /// <inheritdoc />
    public partial class AddPlayerStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlayerStats",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GrenadesThrown = table.Column<int>(type: "INTEGER", nullable: false),
                    M79ShotsFired = table.Column<int>(type: "INTEGER", nullable: false),
                    TimeSpentOnServer = table.Column<TimeSpan>(type: "TEXT", nullable: false),
                    MapFinishes = table.Column<int>(type: "INTEGER", nullable: false),
                    Respawns = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerStats", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlayerStats");
        }
    }
}
