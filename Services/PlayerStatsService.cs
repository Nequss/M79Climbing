using M79Climbing.Data;
using M79Climbing.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace M79Climbing.Services
{
    public class PlayerStatsService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public PlayerStatsService(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task<List<PlayerStats>> GetAllAsync()
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();
                return await context.PlayerStats.ToListAsync();
            }
        }

        public async Task SavePlayerStatAsync(string[] parts)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                var playerStats = new PlayerStats
                {
                    Ip = parts[1],
                    Name = parts[2],
                    GrenadesThrown = int.Parse(parts[3]),
                    M79ShotsFired = int.Parse(parts[4]),
                    TimeSpentOnServer = TimeSpan.FromSeconds(int.Parse(parts[5])),
                    MapFinishes = int.Parse(parts[6]),
                    Respawns = int.Parse(parts[7])
                };

                context.PlayerStats.Add(playerStats);
                await context.SaveChangesAsync();
            }
        }

        public async Task UpdatePlayerStatAsync(PlayerStats playerStats)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                context.PlayerStats.Update(playerStats);
                await context.SaveChangesAsync();
            }
        }

        public async Task<PlayerStats> FindByIpOrNameAsync(string ip = null, string name = null)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                var query = context.PlayerStats.AsQueryable();

                // Use OR logic: find by IP or Name
                if (!string.IsNullOrEmpty(ip) && !string.IsNullOrEmpty(name))
                {
                    query = query.Where(ps => ps.Ip == ip || ps.Name.Contains(name));
                }
                else if (!string.IsNullOrEmpty(ip))
                {
                    query = query.Where(ps => ps.Ip == ip);
                }
                else if (!string.IsNullOrEmpty(name))
                {
                    query = query.Where(ps => ps.Name.Contains(name));
                }

                // Use FirstOrDefaultAsync to return a single match or null if none is found
                return await query.FirstOrDefaultAsync();
            }
        }
    }
}
