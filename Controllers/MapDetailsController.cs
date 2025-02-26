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
            var times = _context.Cap
                .Where(c => c.Map == map)
                .GroupBy(c => c.Name)
                .AsEnumerable() // Switch to LINQ-to-Objects
                .Select(g => g.OrderBy(c => c.Time).FirstOrDefault())
                .OrderBy(c => c.Time)
                .ToList();


            var capsCount = await _context.Cap
                .Where(c => c.Map == map)
                .CountAsync();

            ViewData["Map"] = map;
            ViewData["CapsCount"] = capsCount;

            return View(times);
        }
    }
}
