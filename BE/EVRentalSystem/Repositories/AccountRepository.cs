using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.JWT;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Repositories.BaseRepository;
using Repositories.DBContext;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Repositories
{
    public class AccountRepository : BaseRepository<Account>
    {
        private static AccountRepository instance;
        private readonly JWTConfig _jwtConfig;
        private readonly IPasswordHasher<Account> _passwordHasher;
        private static readonly object instancelock = new object();

        public AccountRepository()
        {
            _jwtConfig = GetJwtConfig();
            _passwordHasher = new PasswordHasher<Account>();
        }

        public static AccountRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new AccountRepository();
                    }
                    return instance;
                }
            }
        }

        private static JWTConfig GetJwtConfig()
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            IConfigurationRoot configuration = builder.Build();

            var jwtConfig = configuration.GetSection("JwtConfig").Get<JWTConfig>();
            return jwtConfig;
        }

        public string GenerateToken(TokenModel model)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfig.Key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
            {
                new Claim(UserClaimTypes.AccountID, model.AccountID.ToString()),
                new Claim(UserClaimTypes.FullName, model.FullName),
                new Claim(UserClaimTypes.Email, model.Email),
                new Claim(UserClaimTypes.RoleID, model.RoleID.ToString()),
            };
            var token = new JwtSecurityToken(
                issuer: _jwtConfig.Issuer,
                audience: _jwtConfig.Audience,
                claims: claims,
            expires: DateTime.Now.AddMinutes(60),
                signingCredentials: credentials
                );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<TokenModel> LoginAsync(JWTLoginModel loginAccount)
        {
            var tokenizedData = new TokenModel();
            var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
            IConfigurationRoot configuration = builder.Build();

            if (loginAccount.Email == configuration["Email"] && loginAccount.Password == configuration["Password"])
            {
                var aAccount = new Account()
                {
                    FullName = "SystemAdmin",
                    Email = "admin@gmail.com",
                    RoleID = 3,
                    Role = new Role { RoleName = "Admin" }
                };
                tokenizedData = new TokenModel
                {
                    AccountID = 0, // Nếu là admin, có thể đặt ID mặc định
                    FullName = aAccount.FullName,
                    Email = aAccount.Email,
                    RoleID = aAccount.RoleID,
                    RoleName = aAccount.Role?.RoleName ?? "Unknown"
                };
            }
            else
            {
                using (var db = new EVRenterDBContext())
                {
                    var account = await db.Accounts
                        .Include(x => x.Role) // Load Role từ DB
                        .FirstOrDefaultAsync(x => x.Email == loginAccount.Email);

                    if (account == null)
                    {
                        throw new KeyNotFoundException("Email hoặc mật khẩu sai!");
                    }

                    var checkPassword = _passwordHasher.VerifyHashedPassword(account, account.Password, loginAccount.Password);

                    if (checkPassword == PasswordVerificationResult.Success)
                    {
                        tokenizedData = new TokenModel
                        {
                            AccountID = account.AccountId,
                            FullName = account.FullName,
                            Email = account.Email,
                            RoleID = account.RoleID,
                            RoleName = account.Role?.RoleName ?? "Unknown" // Kiểm tra null
                        };
                    }
                    else
                    {
                        throw new Exception("Mật khẩu sai!");
                    }
                }
            }
            return tokenizedData;
        }

        public async Task<LoginInfoDTO> Login(JWTLoginModel model)
        {
            var acc = await LoginAsync(model);
            var token = GenerateToken(acc);

            return new LoginInfoDTO
            {
                AccountID = acc.AccountID,
                FullName = acc.FullName,
                RoleID = acc.RoleID,
                Email = acc.Email,
                RoleName = acc.RoleName,
                Token = token
            };
        }

        public async Task<bool> CheckEmail(string email)
        {
            using (var db = new EVRenterDBContext())
            {
                var account = await db.Accounts.FirstOrDefaultAsync(x => x.Email == email);
                if (account != null)
                {
                    return true;
                }
                return false;
            }
        }
    }
}