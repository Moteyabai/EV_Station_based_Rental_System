using BusinessObject.Models;
using BusinessObject.Models.Enum;
using Microsoft.EntityFrameworkCore;
using Repositories.BaseRepository;

namespace Repositories
{
    public class IDDocumentRepository : BaseRepository<IDDocument>
    {
        private static IDDocumentRepository instance;
        private static readonly object instancelock = new object();

        public IDDocumentRepository()
        {
        }

        public static IDDocumentRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new IDDocumentRepository();
                    }
                    return instance;
                }
            }
        }

        public async Task<IEnumerable<IDDocument>> GetPendingDocumentsAsync()
        {
            try
            {
                return await _context.IDDocuments.Where(x => x.Status==(int)DocumentStatus.Pending).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception("Error retrieving pending ID documents: " + ex.Message);
            }

    }
}