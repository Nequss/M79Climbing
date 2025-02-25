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
        public async Task<int[]> GetTopPlacesCountsAsync(string name)
        {
            int[] results = new int[3]; // Array to hold top1, top2, top3 counts

            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                // Retrieve records by Name
                var playerRecords = await context.Cap
                    .Where(c => c.Name == name)
                    .ToListAsync();

                // Get all maps with their records ordered by time
                var mapsWithRecords = await context.Cap
                    .GroupBy(c => c.Map)
                    .Select(g => new
                    {
                        Map = g.Key,
                        Records = g.OrderBy(c => c.Time).ToList()
                    })
                    .ToListAsync();

                // For each map, check if player has top1, top2, or top3 place
                foreach (var map in mapsWithRecords)
                {
                    // Check top1 (if map has at least 1 record)
                    if (map.Records.Count >= 1)
                    {
                        var top1Record = map.Records[0];
                        if (playerRecords.Any(r => r.Map == map.Map && r.Time == top1Record.Time))
                        {
                            results[0]++;
                        }
                    }

                    // Check top2 (if map has at least 2 records)
                    if (map.Records.Count >= 2)
                    {
                        var top2Record = map.Records[1];
                        if (playerRecords.Any(r => r.Map == map.Map && r.Time == top2Record.Time))
                        {
                            results[1]++;
                        }
                    }

                    // Check top3 (if map has at least 3 records)
                    if (map.Records.Count >= 3)
                    {
                        var top3Record = map.Records[2];
                        if (playerRecords.Any(r => r.Map == map.Map && r.Time == top3Record.Time))
                        {
                            results[2]++;
                        }
                    }
                }
            }

            return results;
        }
    }
}

