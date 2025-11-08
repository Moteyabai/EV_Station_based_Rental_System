using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Repositories;
using Repositories.DBContext;
using Services;
using System.Text;

namespace API.CustomServices
{
    public static class CustomService
    {
        public static void AddCustomServices(this IServiceCollection services, IConfiguration configuration)
        {
            // ✅ Register DbContext FIRST with additional SQL Server configuration
            services.AddDbContext<EVRenterDBContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions => sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 1,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null
                    )
                ));

            // ✅ Register IConfiguration as singleton (needed for AccountRepository)
            services.AddSingleton(configuration);

            // Register password hasher
            services.AddScoped<IPasswordHasher<Account>, PasswordHasher<Account>>();

            // Register all repositories with DI
            services.AddScoped<AccountRepository>();
            services.AddScoped<IDDocumentRepository>();
            services.AddScoped<EVBikeRepository>();
            services.AddScoped<RenterRepository>();
            services.AddScoped<StationStaffRepository>();
            services.AddScoped<RentalRepository>();
            services.AddScoped<PaymentRepository>();
            services.AddScoped<StationRepository>();
            services.AddScoped<EVBike_StocksRepository>();
            services.AddScoped<BrandRepository>();
            services.AddScoped<NotificationRepository>();

            // Register all services with DI
            services.AddScoped<AccountService>();
            services.AddScoped<IDDocumentService>();
            services.AddScoped<EVBikeService>();
            services.AddScoped<RenterService>();
            services.AddScoped<StationStaffService>();
            services.AddScoped<RentalService>();
            services.AddScoped<PaymentService>();
            services.AddScoped<StationService>();
            services.AddScoped<EVBike_StocksService>();
            services.AddScoped<BrandService>();

            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
        .AddJwtBearer(o =>
        {
            o.TokenValidationParameters = new TokenValidationParameters
            {
                ValidIssuer = configuration["JwtConfig:Issuer"],
                ValidAudience = configuration["JwtConfig:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["JwtConfig:Key"])),
                ValidateIssuer = !string.IsNullOrEmpty(configuration["JwtConfig:Issuer"]),
                ValidateAudience = !string.IsNullOrEmpty(configuration["JwtConfig:Audience"]),
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true
            };
        });

            services.AddAutoMapper(cfg =>
            {
                cfg.CreateMap<AccountRegisterDTO, Account>();
            });
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend",
            policy =>
            {
                policy.WithOrigins("") // Allow frontend
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowAnyOrigin();
            });
            });

            services.AddAuthorization(options =>
            {
                options.AddPolicy("Renter", policy => policy.RequireClaim("RoleID", "1"));
                options.AddPolicy("Staff", policy => policy.RequireClaim("RoleID", "2"));
                options.AddPolicy("Admin", policy => policy.RequireClaim("RoleID", "3"));
            });

            services.AddSwaggerGen(option =>
            {
                option.SwaggerDoc("v1", new OpenApiInfo { Title = "EVRenting API", Version = "v1" });
                option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter a valid token",
                    Name = "JwtAuthorization",
                    Type = SecuritySchemeType.Http,
                    BearerFormat = "JWT",
                    Scheme = "Bearer"
                });
                option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
            });
        }
    }
}