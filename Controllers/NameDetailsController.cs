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

            ViewData["Name"] = name;
            ViewData["CapsCount"] = times.Count;
            ViewData["PlayerStats"] = playerStats;

            ViewData["Top1Count"] = await _highscoreService.GetTop1CountAsync(name);
            ViewData["Top2Count"] = await _highscoreService.GetTop2CountAsync(name);
            ViewData["Top3Count"] = await _highscoreService.GetTop3CountAsync(name);

            return View(times);
        }
    }
}
