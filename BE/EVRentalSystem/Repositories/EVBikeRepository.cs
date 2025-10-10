using BusinessObject.Models;
using Repositories.BaseRepository;

namespace Repositories
{
    public class EVBikeRepository : BaseRepository<EVBike>
    {
        private static EVBikeRepository instance;
        private static readonly object instancelock = new object();

        public EVBikeRepository()
        {
        }

        public static EVBikeRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new EVBikeRepository();
                    }
                    return instance;
                }
            }
        }
    }
}