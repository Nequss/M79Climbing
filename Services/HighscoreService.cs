using M79Climbing.Data;
using M79Climbing.Models;
using Microsoft.EntityFrameworkCore;

namespace M79Climbing.Services
{
    public class HighscoreService
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;

        public HighscoreService(IServiceScopeFactory serviceScopeFactory)
        {
            _serviceScopeFactory = serviceScopeFactory;
        }

        // Save highscore to database
        public async Task SaveHighscoreAsync(string[] parts)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                var cap = new Cap
                {
                    Ip = parts[1],
                    Name = parts[2],
                    Map = parts[3],
                    Time = int.Parse(parts[4]),
                    CapDate = DateTime.Now
                };

                context.Cap.Add(cap);
                await context.SaveChangesAsync();
            }
        }

        public async Task<int> GetTop1CountAsync(string name)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                var groupedMaps = await context.Cap
                    .GroupBy(c => c.Map)
                    .ToListAsync();

                var top1Count = groupedMaps
                    .Select(g => g.OrderBy(c => c.Time).FirstOrDefault())
                    .Count(record => record != null && record.Name == name);

                return top1Count;
            }
        }

        public async Task<int> GetTop2CountAsync(string name)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                var groupedMaps = await context.Cap
                    .GroupBy(c => c.Map)
                    .ToListAsync();

                var top2Count = groupedMaps
                    .Select(g => g.OrderBy(c => c.Time).Skip(1).FirstOrDefault())
                    .Count(record => record != null && record.Name == name);

                return top2Count;
            }
        }

        public async Task<int> GetTop3CountAsync(string name)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                var groupedMaps = await context.Cap
                    .GroupBy(c => c.Map)
                    .ToListAsync();

                var top3Count = groupedMaps
                    .Select(g => g.OrderBy(c => c.Time).Skip(2).FirstOrDefault())
                    .Count(record => record != null && record.Name == name);

                return top3Count;
            }
        }
    }
}

