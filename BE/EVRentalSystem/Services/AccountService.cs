using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using Repositories;
using Repositories.BaseRepository;
using Services.Interfaces;

namespace Services
{
    public class AccountService : IBaseService<Account>
    {
        private readonly AccountRepository _accountRepository;

        public AccountService()
        {
            _accountRepository = AccountRepository.Instance;
        }

        public Task AddAsync(Account entity) => _accountRepository.AddAsync(entity);

        public Task DeleteAsync(int id) => _accountRepository.DeleteAsync(id);

        public Task<IEnumerable<Account>> GetAllAsync() => _accountRepository.GetAllAsync();

        public Task<Account> GetByIdAsync(int id) => _accountRepository.GetByIdAsync(id);

        public Task UpdateAsync(Account entity) => _accountRepository.UpdateAsync(entity);

        public Task<AccountDTO> Login(string email, string password) => _accountRepository.Login(email, password);
    }
}