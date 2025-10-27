using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Repositories;
using Services;
using System.Text;

namespace API.CustomServices
{
    public static class CustomService
    {
        public static void AddCustomServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Register password hasher (optional - AccountRepository can create its own)
            services.AddScoped<IPasswordHasher<Account>, PasswordHasher<Account>>();

            services.AddScoped<AccountRepository>();
            services.AddScoped<AccountService>();
            services.AddScoped<IDDocumentRepository>();
            services.AddScoped<IDDocumentService>();
            services.AddScoped<EVBikeRepository>();
            services.AddScoped<EVBikeService>();
            services.AddScoped<RenterRepository>();
            services.AddScoped<RenterService>();
            services.AddScoped<StationStaffRepository>();
            services.AddScoped<StationStaffService>();
            services.AddScoped<RentalRepository>();
            services.AddScoped<RentalService>();
            services.AddScoped<PaymentRepository>();
            services.AddScoped<PaymentService>();
            services.AddScoped<StationRepository>();
            services.AddScoped<StationService>();
            services.AddScoped<EVBike_StocksRepository>();
            services.AddScoped<EVBike_StocksService>();

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