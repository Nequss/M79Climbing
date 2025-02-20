using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using M79Climbing.Data;
using M79Climbing.Models;
using System.Linq;
using System.Threading.Tasks;

namespace M79Climbing.Controllers
{
    public class NameDetailsController : Controller
    {
        private readonly M79ClimbingContext _context;

        public NameDetailsController(M79ClimbingContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index(string name)
        {
            var times = await _context.Cap
                .Where(c => c.Name == name)
                .OrderBy(c => c.Name) 
                .ThenBy(c => c.Time)  
                .ToListAsync();

            ViewData["Name"] = name;
            ViewData["CapsCount"] = times.Count;
            return View(times);
        }
    }
}
