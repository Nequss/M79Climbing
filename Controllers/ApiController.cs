using M79Climbing.Data;
using M79Climbing.Helpers;
using M79Climbing.Models;
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
        private readonly ILogger<ApiController> _logger;
        private readonly M79ClimbingContext _context;

        public ApiController(ILogger<ApiController> logger, M79ClimbingContext context)
        {
            _logger = logger;
            _context = context;
        }

        [HttpGet("index")]
        public IActionResult Index()
        {
            return View();
        }

        // Get all times for a given map searched by Name or IP if Name not found
        [HttpGet("times/{playerIp}/{playerName}/{mapName}")]
        public async Task<IActionResult> GetAllTimes(string playerIp, string playerName, string mapName)
        {
            var records = await _context.Cap
                .Where(c => c.Map == mapName && (c.Name == playerName || c.Ip == playerIp))
                .OrderBy(c => c.Time)
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

        // Get best times for a map, limited by X
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

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
