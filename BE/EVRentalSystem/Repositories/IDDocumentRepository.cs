using BusinessObject.Models;
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
    }
}