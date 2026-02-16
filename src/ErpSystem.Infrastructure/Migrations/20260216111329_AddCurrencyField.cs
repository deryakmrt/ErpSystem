using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "products",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "products");
        }
    }
}
