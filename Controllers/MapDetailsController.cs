using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using M79Climbing.Data;
using M79Climbing.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;



namespace M79Climbing.Controllers
{
    public class MapDetailsController : Controller
    {
        private readonly M79ClimbingContext _context;

        public MapDetailsController(M79ClimbingContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(string map)
        {
            var times = await _context.Cap
                .Where(c => c.Map == map) // Filter by map first
                .GroupBy(c => c.Name)
                .Select(g => g.OrderBy(c => c.Time).FirstOrDefault())
                .OrderBy(c => c.Time) // Order by Time in ascending order
                .ToListAsync();

            var capsCount = await _context.Cap
                .Where(c => c.Map == map)
                .CountAsync();

            ViewData["Map"] = map;
            ViewData["CapsCount"] = capsCount;

            return View(times);
        }
    }
}
