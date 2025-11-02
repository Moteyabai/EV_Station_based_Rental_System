using BusinessObject.Models;
using Repositories.BaseRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repositories
{
    public class BrandRepository : BaseRepository<Brand>
    {
        private static BrandRepository instance;
        private static readonly object instancelock = new object();

        public BrandRepository()
        {
        }

        public static BrandRepository Instance
        {
            get
            {
                lock (instancelock)
                {
                    if (instance == null)
                    {
                        instance = new BrandRepository();
                    }
                    return instance;
                }
            }
        }
    }
}
