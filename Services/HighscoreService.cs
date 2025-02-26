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

        // Get amount of top1, top2, top3 caps for a player
        public async Task<int[]> GetTopPlacesCountsAsync(string name)
        {
            int[] results = new int[3]; // Array to hold top1, top2, top3 counts

            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<M79ClimbingContext>();

                var mapsWithRanks = await context.Cap
                    .GroupBy(c => c.Map)
                    .Select(g => new
                    {
                        Map = g.Key,
                        Records = g.OrderBy(c => c.Time).ToList() // Fetch records first
                    })
                    .ToListAsync();

                // Rank the records in-memory
                var rankedMaps = mapsWithRanks.Select(map => new
                {
                    Map = map.Map,
                    Rankings = map.Records
                        .Select((record, index) => new
                        {
                            Record = record,
                            Rank = index + 1
                        })
                        .ToList()
                }).ToList();


                // Count top places for the specified player
                foreach (var map in rankedMaps)
                {
                    // Top 1
                    if (map.Rankings.Count == 1 &
                        map.Rankings[0].Record.Name == name)
                    {
                        results[0]++;
                    }

                    // Top 2
                    if (map.Rankings.Count >= 2 &
                        map.Rankings[1].Record.Name == name)
                    {
                        results[1]++;
                    }

                    // Top 3
                    if (map.Rankings.Count >= 3 &
                        map.Rankings[2].Record.Name == name)
                    {
                        results[2]++;
                    }
                }
            }

            return results;
        }

    }
}

