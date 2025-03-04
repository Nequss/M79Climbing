using M79Climbing.Data;
using M79Climbing.Helpers;
using M79Climbing.Models;
using M79Climbing.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace M79Climbing.Controllers
{

    [Route("api")]
    public class ApiController : Controller
    {
        private readonly M79ClimbingContext _context;
        private readonly HighscoreService _highscoreService;

        public ApiController(M79ClimbingContext context, HighscoreService highscoreService)
        {
            _context = context;
            _highscoreService = highscoreService;
        }

        [HttpGet("index")]
        public IActionResult Index()
        {
            return View();
        }

        // Gets top X times for a given map searched by Name or IP if Name not found
        [HttpGet("times/{playerName}/{mapName}/{x}")]
        public async Task<IActionResult> GetAllTimes(string playerName, string mapName, int x)
        {
            var records = await _context.Cap
                .Where(c => c.Map == mapName && c.Name == playerName) // Filter by map and user
                .OrderBy(c => c.Time) // Order by time
                .Take(x) // Limit results
                .ToListAsync();

            if (records.Count == 0)
                return Content("No records found");

            var result = new StringBuilder();

            foreach (var record in records)
            {
                result.AppendLine($"{record.Name} {TimeHelper.ReturnTime(record.Time)} {record.CapDate:yyyy-MM-dd HH:mm:ss}");
            }

            return Content(result.ToString());
        }

        // Gest best times for a map, limited by X
        [HttpGet("besttimes/{mapName}/{x}")]
        public async Task<IActionResult> GetBestTimes(string mapName, int x)
        {
            var records = await _context.Cap
                .Where(c => c.Map == mapName)
                .OrderBy(c => c.Time) // Best times are lowest times
                .Take(x)
                .ToListAsync();

            if (records.Count == 0)
                return Content("No records found");

            var result = new StringBuilder();
            foreach (var record in records)
            {
                result.AppendLine($"{record.Name} {TimeHelper.ReturnTime(record.Time)} {record.CapDate:yyyy-MM-dd HH:mm:ss}");
            }

            return Content(result.ToString());
        }

        [HttpGet("playerstats/{playerName}")]
        public async Task<IActionResult> GetPlayerStats(string playerName)
        {
            // Get the first record of the player by their name
            var record = await _context.PlayerStats
                .Where(c => c.Name == playerName)
                .FirstOrDefaultAsync(); // Get only the first record

            if (record == null)
                return Content("No player found");

            // Retrieve the top counts for the player
            int top1 = await _highscoreService.GetTop1CountAsync(record.Name);
            int top2 = await _highscoreService.GetTop2CountAsync(record.Name);
            int top3 = await _highscoreService.GetTop3CountAsync(record.Name);

            // Get the total number of caps for the player
            var caps = await _context.Cap
                .Where(c => c.Name == playerName)
                .OrderBy(c => c.Name)
                .ThenBy(c => c.Time)
                .ToListAsync();

            int capsCount = caps.Count;

            // Prepare the result with the top count inserted
            var result = new
            {
                Top1 = top1,
                Top2 = top2,
                Top3 = top3,
                TotalCaps = capsCount,
                record.GrenadesThrown,
                record.M79ShotsFired,
                TimeSpentOnServer = record.TimeSpentOnServer.ToString(@"hh\:mm\:ss"), // Convert TimeSpan to string format
                ServerVisits = record.MapFinishes, // Renamed from MapFinishes to ServerVisits
                record.Respawns,
            };

            return Json(result);
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
