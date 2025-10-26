using BusinessObject.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Repositories.DBContext
{
    public class EVRenterDBContext : DbContext
    {
        public EVRenterDBContext()
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false);
            IConfigurationRoot configuration = builder.Build();
            optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"), options => options.EnableRetryOnFailure(
                maxRetryCount: 1,
                maxRetryDelay: TimeSpan.FromSeconds(30),
                errorNumbersToAdd: null)
                );
        }

        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Station> Stations { get; set; }
        public DbSet<EVBike> EVBikes { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<IDDocument> IDDocuments { get; set; }
        public DbSet<Rental> Rentals { get; set; }
        public DbSet<Renter> Renters { get; set; }
        public DbSet<StationStaff> StationStaffs { get; set; }
        public DbSet<Feedback> Feedbacks { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Account entity if needed
            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasKey(e => e.AccountId);
                entity.Property(e => e.Email).IsRequired();
                entity.Property(e => e.Password).IsRequired();
                entity.Property(e => e.FullName).IsRequired();
            });

            // Configure Role entity
            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.RoleId);
                entity.Property(e => e.RoleName).IsRequired();

                // Seed data for roles
                entity.HasData(
                    new Role { RoleId = 1, RoleName = "Renter" },
                    new Role { RoleId = 2, RoleName = "StationStaff" },
                    new Role { RoleId = 3, RoleName = "Admin" }
                );
            });
        }
    }
}