using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using M79Climbing.Data;
using M79Climbing.Models;
using System.Linq;
using System.Threading.Tasks;
using M79Climbing.Services;

namespace M79Climbing.Controllers
{
    public class NameDetailsController : Controller
    {
        private readonly M79ClimbingContext _context;
        private readonly PlayerStatsService _playerStatsService;
        private readonly HighscoreService _highscoreService;

        public NameDetailsController
        (
            M79ClimbingContext context,
            PlayerStatsService playerStatsService, 
            HighscoreService highscoreService
        )
        {
            _context = context;
            _playerStatsService = playerStatsService;
            _highscoreService = highscoreService;
        }

        public async Task<IActionResult> Index(string name)
        {
            var times = await _context.Cap
                .Where(c => c.Name == name)
                .OrderBy(c => c.Name) 
                .ThenBy(c => c.Time)  
                .ToListAsync();

            // Fetch PlayerStats for the specific player
            var playerStats = await _playerStatsService.FindByIpOrNameAsync(name: name);

            // Fetch top1, top2, top3 counts for the player
            var topAmounts = await _highscoreService.GetTopPlacesCountsAsync(name: name);

            ViewData["Name"] = name;
            ViewData["CapsCount"] = times.Count;
            ViewData["PlayerStats"] = playerStats;

            ViewData["Top1Count"] = topAmounts[0];
            ViewData["Top2Count"] = topAmounts[1];
            ViewData["Top3Count"] = topAmounts[2];

            return View(times);
        }
    }
}
