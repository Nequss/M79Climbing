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

                // Debugging output
                Console.WriteLine("Ordered Records:");
                foreach (var record in orderedRecords)
                {
                    Console.WriteLine($"Name: {record.Name}, Map: {record.Map}, Time: {record.Time}");
                }

                // Step 2: Group ordered records by Map
                var groupedMaps = orderedRecords
                    .GroupBy(c => c.Map);

                // Debugging output
                Console.WriteLine("\nGrouped Records by Map:");
                foreach (var group in groupedMaps)
                {
                    Console.WriteLine($"Map: {group.Key}");
                    foreach (var record in group)
                    {
                        Console.WriteLine($"Name: {record.Name}, Time: {record.Time}");
                    }
                }

                // Step 3: Select the second record (Top 2) from each group, excluding the first place if it's the specified name
                var top2Records = groupedMaps
                    .Select(g =>
                    {
                        var firstPlace = g.FirstOrDefault(); // Get the first place (best time)
                        var secondPlace = g.Skip(1).FirstOrDefault(); // Get the second place
                        if (firstPlace != null && firstPlace.Name == name)
                        {
                            // If the first place is the given name, exclude it and return the second fastest
                            return secondPlace;
                        }
                        else
                        {
                            // Otherwise, return the first place if it's the second fastest
                            return secondPlace != null ? secondPlace : firstPlace;
                        }
                    })
                    .Where(record => record != null); // Filter out null records

                // Debugging output
                Console.WriteLine("\nTop 2 Records (Second in each group excluding the first if the user is first):");
                foreach (var record in top2Records)
                {
                    Console.WriteLine($"Name: {record.Name}, Map: {record.Map}, Time: {record.Time}");
                }

                // Step 4: Count how many of the Top 2 records match the given name
                int top2Count = top2Records.Count(record => record.Name == name);

                Console.WriteLine($"\nTop 2 Count for {name}: {top2Count}");

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

                // Debugging output
                Console.WriteLine("Ordered Records:");
                foreach (var record in orderedRecords)
                {
                    Console.WriteLine($"Name: {record.Name}, Map: {record.Map}, Time: {record.Time}");
                }

                // Step 2: Group ordered records by Map
                var groupedMaps = orderedRecords
                    .GroupBy(c => c.Map);

                // Debugging output
                Console.WriteLine("\nGrouped Records by Map:");
                foreach (var group in groupedMaps)
                {
                    Console.WriteLine($"Map: {group.Key}");
                    foreach (var record in group)
                    {
                        Console.WriteLine($"Name: {record.Name}, Time: {record.Time}");
                    }
                }

                // Step 3: Select the third record (Top 3) from each group, excluding the first and second if the user is already there
                var top3Records = groupedMaps
                    .Select(g =>
                    {
                        var firstPlace = g.FirstOrDefault(); // Get the first place (best time)
                        var secondPlace = g.Skip(1).FirstOrDefault(); // Get the second place
                        var thirdPlace = g.Skip(2).FirstOrDefault(); // Get the third place

                        if (firstPlace != null && firstPlace.Name == name)
                        {
                            // If the first place is the given name, exclude it and return the third fastest
                            return thirdPlace;
                        }
                        else if (secondPlace != null && secondPlace.Name == name)
                        {
                            // If the second place is the given name, exclude it and return the third fastest
                            return thirdPlace;
                        }
                        else
                        {
                            // Otherwise, return the third fastest or null if no third place exists
                            return thirdPlace;
                        }
                    })
                    .Where(record => record != null); // Filter out null records

                // Debugging output
                Console.WriteLine("\nTop 3 Records (Third in each group excluding first and second if the user is first or second):");
                foreach (var record in top3Records)
                {
                    Console.WriteLine($"Name: {record.Name}, Map: {record.Map}, Time: {record.Time}");
                }

                // Step 4: Count how many of the Top 3 records match the given name
                int top3Count = top3Records.Count(record => record.Name == name);

                Console.WriteLine($"\nTop 3 Count for {name}: {top3Count}");

                return top3Count;
            }
        }

    }
}