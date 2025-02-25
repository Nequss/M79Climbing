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
            Console.WriteLine($"FindByIpOrNameAsync called with IP: '{ip}', Name: '{name}'");

            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();
                Console.WriteLine("Created database context");

                var query = context.PlayerStats.AsQueryable();
                Console.WriteLine("Created initial query");

                // Use OR logic: find by IP or Name
                if (!string.IsNullOrEmpty(ip) && !string.IsNullOrEmpty(name))
                {
                    Console.WriteLine($"Searching by both IP '{ip}' OR Name '{name}'");
                    query = query.Where(ps => ps.Ip == ip || ps.Name.Contains(name));
                }
                else if (!string.IsNullOrEmpty(ip))
                {
                    Console.WriteLine($"Searching by IP only: '{ip}'");
                    query = query.Where(ps => ps.Ip == ip);
                }
                else if (!string.IsNullOrEmpty(name))
                {
                    Console.WriteLine($"Searching by Name only: '{name}'");
                    query = query.Where(ps => ps.Name.Contains(name));
                }
                else
                {
                    Console.WriteLine("Warning: Both IP and Name are empty or null");
                }

                // Log the SQL query being executed (if possible)
                try
                {
                    var sql = query.ToQueryString();
                    Console.WriteLine($"Generated SQL query: {sql}");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Could not log SQL query: {ex.Message}");
                }

                // Use FirstOrDefaultAsync to return a single match or null if none is found
                var result = await query.FirstOrDefaultAsync();

                if (result != null)
                {
                    Console.WriteLine($"Found player: ID={result.Id}, Name='{result.Name}', IP='{result.Ip}'");
                }
                else
                {
                    Console.WriteLine("No matching player found");
                }

                return result;
            }
        }
    }
}
