using Microsoft.EntityFrameworkCore;
using Repositories.DBContext;

namespace Repositories.BaseRepository
{
    public class BaseRepository<TEntity> where TEntity : class
    {
        protected readonly EVRenterDBContext _context;
        private DbSet<TEntity> _dbSet;

        // Default constructor for backward compatibility (creates own context)
        public BaseRepository()
        {
            _context = new EVRenterDBContext();
            _dbSet = _context.Set<TEntity>();
        }

        // ✅ NEW: Constructor for Dependency Injection (RECOMMENDED)
        // Each request gets its own DbContext instance - thread-safe
        public BaseRepository(EVRenterDBContext context)
        {
            _context = context;
            _dbSet = _context.Set<TEntity>();
        }

        public virtual async Task<IEnumerable<TEntity>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<TEntity> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public async Task AddAsync(TEntity entity)
        {
            try
            {
                await _dbSet.AddAsync(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task UpdateAsync(TEntity entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                _dbSet.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}