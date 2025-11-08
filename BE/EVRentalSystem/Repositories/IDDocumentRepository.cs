using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class IDDocumentRepository : BaseRepository<IDDocument>
    {
        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public IDDocumentRepository(EVRenterDBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<IDDocument>> GetPendingDocumentsAsync()
        {
            try
            {
                return await _context.IDDocuments.Where(x => x.Status == (int)DocumentStatus.Pending).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving pending ID documents: " + ex.Message);
            }
        }
    }
}