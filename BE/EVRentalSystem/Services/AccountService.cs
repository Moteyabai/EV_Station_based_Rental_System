using BusinessObject.Models;
using BusinessObject.Models.DTOs;
using BusinessObject.Models.JWT;
using Repositories;
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

        public async Task AddAsync(Account entity) => await _accountRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _accountRepository.DeleteAsync(id);

        public async Task<IEnumerable<Account>> GetAllAsync() => await _accountRepository.GetAllAsync();

        public async Task<Account> GetByIdAsync(int id) => await _accountRepository.GetByIdAsync(id);

        public async Task UpdateAsync(Account entity) => await _accountRepository.UpdateAsync(entity);

        public async Task<LoginInfoDTO> Login(JWTLoginModel model) => await _accountRepository.Login(model);

        public async Task<bool> CheckEmail(string email) => await _accountRepository.CheckEmail(email);
    }
}