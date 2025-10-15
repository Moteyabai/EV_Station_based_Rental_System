using BusinessObject.Models;
using Repositories.BaseRepository;

namespace Repositories
{
    public class StationRepository : BaseRepository<Station>
    {
        private static StationRepository? instance;
        private static readonly object instancelock = new object();

        public StationRepository() : base()
        {
        }

        public static StationRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new StationRepository();
                    }
                    return instance;
                }
            }
        }
    }
}