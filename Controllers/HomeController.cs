using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using M79Climbing.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using M79Climbing.Data;

namespace M79Climbing.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;
    private readonly M79ClimbingContext _context;

    public HomeController(ILogger<HomeController> logger, M79ClimbingContext context)
    {
        _logger = logger;
        _context = context;
    }

    public IActionResult Index()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
