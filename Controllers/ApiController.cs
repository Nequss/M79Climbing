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
        private readonly IWebHostEnvironment _webHostEnvironment;

        public ApiController( 
            M79ClimbingContext context,
            HighscoreService highscoreService,
            IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _highscoreService = highscoreService;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet("index")]
        public IActionResult Index()
        {
            return View();
        }

        // Gets top X times for a given player on a specific map, sorted from fastest to slowest
        [HttpGet("times/{playerName}/{mapName}/{x}")]
        public async Task<IActionResult> GetAlltimes(string playerName, string mapName, int x)
        {
            // Find records by player name
            var playerRecords = await _context.Cap
                .Where(c => c.Map == mapName && c.Name == playerName)
                .OrderBy(c => c.Time) // Sort by fastest time
                .Take(x) // Limit to X records
                .ToListAsync();

            if (playerRecords.Count == 0)
                return Content("No records found");

            var result = new StringBuilder();

            foreach (var record in playerRecords)
            {
                result.AppendLine($"{record.Name} {TimeHelper.ReturnTime(record.Time)} {record.CapDate:yyyy-MM-dd HH:mm:ss}");
            }

            return Content(result.ToString());
        }



        // Gets best times for a map, one per player, limited by X
        [HttpGet("besttimes/{mapName}/{x}")]
        public async Task<IActionResult> GetBestTimes(string mapName, int x)
        {
            // First get all records for this map
            var allRecords = await _context.Cap
                .Where(c => c.Map == mapName)
                .ToListAsync();

            // Then use LINQ-to-Objects to get the best time per player
            var bestRecordsPerPlayer = allRecords
                .GroupBy(c => c.Name)
                .Select(g => g.OrderBy(c => c.Time).First())
                .OrderBy(c => c.Time)
                .Take(x)
                .ToList();

            if (bestRecordsPerPlayer.Count == 0)
                return Content("No records found");

            var result = new StringBuilder();
            foreach (var record in bestRecordsPerPlayer)
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

        [HttpGet("textures")]
        public IActionResult Get()
        {
            try
            {
                string texturesPath = Path.Combine(_webHostEnvironment.WebRootPath, "images", "textures");

                if (!Directory.Exists(texturesPath))
                {
                    return NotFound(new { message = "Textures directory not found" });
                }

                var textureFiles = Directory.GetFiles(texturesPath)
                    .Where(file => IsImageFile(file))
                    .Select(file => new
                    {
                        id = Path.GetFileNameWithoutExtension(file).GetHashCode(),
                        name = Path.GetFileNameWithoutExtension(file),
                        path = $"/images/textures/{Path.GetFileName(file)}"
                    })
                    .ToList();

                return Ok(textureFiles);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private bool IsImageFile(string filePath)
        {
            string extension = Path.GetExtension(filePath).ToLowerInvariant();
            return extension == ".jpg" || extension == ".jpeg" || extension == ".png" || extension == ".bmp";
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
