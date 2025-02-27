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

                // Step 1: Order all records by Time
                var orderedRecords = await context.Cap
                    .OrderBy(c => c.Time)
                    .ToListAsync();

                // Step 2: Group ordered records by Map
                var groupedMaps = orderedRecords
                    .GroupBy(c => c.Map);

                // Step 3: Select the second record (Top 2) from each group
                var top2Records = groupedMaps
                    .Select(g => g.Skip(1).FirstOrDefault())
                    .Where(record => record != null); // Filter out null records

                // Step 4: Count how many of the Top 2 records match the given name
                int top2Count = top2Records.Count(record => record.Name == name);

                return top2Count;
            }
        }

        public async Task<int> GetTop3CountAsync(string name)
        {
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                // Step 1: Order all records by Time
                var orderedRecords = await context.Cap
                    .OrderBy(c => c.Time)
                    .ToListAsync();

                // Step 2: Group ordered records by Map
                var groupedMaps = orderedRecords
                    .GroupBy(c => c.Map);

                // Step 3: Select the third record (Top 3) from each group
                var top3Records = groupedMaps
                    .Select(g => g.Skip(2).FirstOrDefault())
                    .Where(record => record != null); // Filter out null records

                // Step 4: Count how many of the Top 3 records match the given name
                int top3Count = top3Records.Count(record => record.Name == name);

                return top3Count;
            }
        }

    }
}

