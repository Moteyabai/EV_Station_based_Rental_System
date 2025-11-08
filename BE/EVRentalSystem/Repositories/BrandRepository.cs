using BusinessObject.Models;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class BrandRepository : BaseRepository<Brand>
    {
        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        public BrandRepository(EVRenterDBContext context) : base(context)
        {
        }
    }
}
