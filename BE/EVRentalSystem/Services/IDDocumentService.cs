using BusinessObject.Models;
using Repositories;
using Services.Interfaces;

namespace Services
{
    public class IDDocumentService : IBaseService<IDDocument>
    {
        private readonly IDDocumentRepository _IDDocumentRepository;

        public IDDocumentService()
        {
            _IDDocumentRepository = IDDocumentRepository.Instance;
        }

        public async Task AddAsync(IDDocument entity) => await _IDDocumentRepository.AddAsync(entity);

        public async Task DeleteAsync(int id) => await _IDDocumentRepository.DeleteAsync(id);

        public async Task<IEnumerable<IDDocument>> GetAllAsync() => await _IDDocumentRepository.GetAllAsync();

        public async Task<IDDocument> GetByIdAsync(int id) => await _IDDocumentRepository.GetByIdAsync(id);

        public async Task UpdateAsync(IDDocument entity) => await _IDDocumentRepository.UpdateAsync(entity);
        public async Task<IEnumerable<IDDocument>> GetPendingDocumentsAsync() => await _IDDocumentRepository.GetPendingDocumentsAsync();
    }
}