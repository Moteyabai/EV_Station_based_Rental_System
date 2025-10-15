using BusinessObject.Models;
using Repositories.BaseRepository;

namespace Repositories
{
    public class RentalRepository : BaseRepository<Rental>
    {
        private static RentalRepository? instance;
        private static readonly object instancelock = new object();

        public RentalRepository() : base()
        {
        }

        public static RentalRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new RentalRepository();
                    }
                    return instance;
                }
            }
        }
    }
}