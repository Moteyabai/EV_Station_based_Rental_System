using BusinessObject.Models;
using Repositories.BaseRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories
{
    public class RenterRepository : BaseRepository<Renter>
    {
        private static RenterRepository instance;
        private static readonly object instancelock = new object();

        public RenterRepository()
        {
        }

        public static RenterRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new RenterRepository();
                    }
                    return instance;
                }
            }
        }
    }
}
