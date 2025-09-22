using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using Microsoft.Extensions.Configuration;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class AccountRepository : BaseRepository<Account>
    {
        //private readonly JwtConfig _jwtConfig;
        private static AccountRepository instance;

        //private readonly IPasswordHasher<Account> _passwordHasher;
        private static readonly object instancelock = new object();

        public AccountRepository()
        {
            //_jwtConfig = jwtConfig;
            //_passwordHasher = passwordHasher;
        }

        public static AccountRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        /*var mapper = GetMapper();

                        var jwtConfig = GetJwtConfig();
                        var passwordHasher = new PasswordHasher<Account>();*/

                        instance = new AccountRepository();
                    }
                    return instance;
                }
            }
        }

        public async Task<AccountDTO> Login(string email, string password)
        {
            var accountDTO = new AccountDTO();
            try
            {
                var builder = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
                IConfigurationRoot configuration = builder.Build();

                if (email == configuration["Email"] && password == configuration["Password"])
                {
                    var aAccount = new AccountDTO()
                    {
                        FullName = "Admin",
                        Email = email,
                        RoleID = 4
                    };
                    accountDTO = aAccount;
                }
                else
                {
                    using (var context = new EVRenterDBContext())
                    {
                        var account = context.Accounts
                            .FirstOrDefault(a => a.Email.Equals(email) && a.Password.Equals(password));
                        if (account == null)
                        {
                            return null;
                        }
                        accountDTO.AccountID = account.AccountId;
                        accountDTO.FullName = account.FullName;
                        accountDTO.Email = account.Email;
                        accountDTO.RoleID = 1; // Default role ID for regular users
                    }
                }

                return accountDTO;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
    }
}