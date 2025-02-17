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
                .Where(c => c.Map == map)
                .OrderBy(c => c.Time)
                .ToListAsync();

            ViewData["Map"] = map;
            return View(times);
        }
    }
}
