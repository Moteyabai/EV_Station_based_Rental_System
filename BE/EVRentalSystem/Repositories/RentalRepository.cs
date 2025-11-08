using BusinessObject.Models;
using Repositories.BaseRepository;
using Repositories.DBContext;

namespace Repositories
{
    public class RentalRepository : BaseRepository<Rental>
    {
        // ? NEW: Constructor for Dependency Injection (RECOMMENDED)
        public RentalRepository(EVRenterDBContext context) : base(context)
        {
        }
    }
}