using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using M79Climbing.Data;
using M79Climbing.Models;

namespace M79Climbing.Controllers
{
    public class CapsController : Controller
    {
        private readonly M79ClimbingContext _context;

        public CapsController(M79ClimbingContext context)
        {
            _context = context;
        }

        // GET: Caps
        public async Task<IActionResult> Index()
        {
            return View(await _context.Cap.ToListAsync());
        }

        // GET: Caps/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var cap = await _context.Cap
                .FirstOrDefaultAsync(m => m.Id == id);
            if (cap == null)
            {
                return NotFound();
            }

            return View(cap);
        }

        // GET: Caps/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Caps/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("Id,Ip,Name,Map,Time,CapDate")] Cap cap)
        {
            if (ModelState.IsValid)
            {
                _context.Add(cap);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(cap);
        }

        // GET: Caps/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var cap = await _context.Cap.FindAsync(id);
            if (cap == null)
            {
                return NotFound();
            }
            return View(cap);
        }

        // POST: Caps/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("Id,Ip,Name,Map,Time,CapDate")] Cap cap)
        {
            if (id != cap.Id)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(cap);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!CapExists(cap.Id))
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
            return View(cap);
        }

        // GET: Caps/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var cap = await _context.Cap
                .FirstOrDefaultAsync(m => m.Id == id);
            if (cap == null)
            {
                return NotFound();
            }

            return View(cap);
        }

        // POST: Caps/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var cap = await _context.Cap.FindAsync(id);
            if (cap != null)
            {
                _context.Cap.Remove(cap);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool CapExists(int id)
        {
            return _context.Cap.Any(c => c.Id == id);
        }
    }
}
