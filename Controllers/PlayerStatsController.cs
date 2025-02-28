using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using M79Climbing.Data;
using M79Climbing.Models;
using Microsoft.AspNetCore.Authorization;

namespace M79Climbing.Controllers
{
    public class PlayerStatsController : Controller
    {
        private readonly M79ClimbingContext _context;

        public PlayerStatsController(M79ClimbingContext context)
        {
            _context = context;
        }

        // GET: PlayerStats
        public async Task<IActionResult> Index()
        {
            var playerStats = await _context.PlayerStats.ToListAsync();

            var times = await _context.Cap.ToListAsync();
            var globalCapCount = times.Count;
            ViewData["GlobalCapsCount"] = times.Count;

            var combinedStats = new
            {
                TotalCaps = playerStats.Sum(s => s.MapFinishes),
                TotalVisits = playerStats.Sum(s => s.MapFinishes),
                TotalPlaytime = TimeSpan.FromSeconds(playerStats.Sum(s => s.TimeSpentOnServer.TotalSeconds)),
                TotalRespawns = playerStats.Sum(s => s.Respawns),
                TotalGrenadesThrown = playerStats.Sum(s => s.GrenadesThrown),
                TotalM79ShotsFired = playerStats.Sum(s => s.M79ShotsFired)
            };

            ViewData["CombinedStats"] = combinedStats;

            return View(playerStats);
        }

        // GET: PlayerStats/Details/5
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var playerStats = await _context.PlayerStats
                .FirstOrDefaultAsync(m => m.Id == id);
            if (playerStats == null)
            {
                return NotFound();
            }

            return View(playerStats);
        }

        // GET: PlayerStats/Create
        [Authorize(Policy = "AdminOnly")]
        public IActionResult Create()
        {
            return View();
        }

        // POST: PlayerStats/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Create([Bind("Id,Ip,Name,GrenadesThrown,M79ShotsFired,TimeSpentOnServer,MapFinishes,Respawns")] PlayerStats playerStats)
        {
            if (ModelState.IsValid)
            {
                _context.Add(playerStats);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(playerStats);
        }

        // GET: PlayerStats/Edit/5
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var playerStats = await _context.PlayerStats.FindAsync(id);
            if (playerStats == null)
            {
                return NotFound();
            }
            return View(playerStats);
        }

        // POST: PlayerStats/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Ip,Name,GrenadesThrown,M79ShotsFired,TimeSpentOnServer,MapFinishes,Respawns")] PlayerStats playerStats)
        {
            if (id != playerStats.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(playerStats);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!PlayerStatsExists(playerStats.Id))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(playerStats);
        }

        // GET: PlayerStats/Delete/5
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var playerStats = await _context.PlayerStats
                .FirstOrDefaultAsync(m => m.Id == id);
            if (playerStats == null)
            {
                return NotFound();
            }

            return View(playerStats);
        }

        // POST: PlayerStats/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        [Authorize(Policy = "AdminOnly")]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var playerStats = await _context.PlayerStats.FindAsync(id);
            if (playerStats != null)
            {
                _context.PlayerStats.Remove(playerStats);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool PlayerStatsExists(int id)
        {
            return _context.PlayerStats.Any(e => e.Id == id);
        }
    }
}
