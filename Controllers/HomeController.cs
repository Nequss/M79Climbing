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

    public IActionResult Privacy()
    {
        return View();
    }

    [HttpPost("UploadFile")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("File is empty or not provided.");
        }

        try
        {
            using (var stream = new StreamReader(file.OpenReadStream()))
            {
                var jsonString = await stream.ReadToEndAsync();
                var cap = JsonSerializer.Deserialize<Cap>(jsonString);

                if (cap != null)
                {
                    cap.CapDate = DateTime.Now;
                    _context.Cap.Add(cap);
                    await _context.SaveChangesAsync();
                }
            }

            return Ok("File uploaded and data saved successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file.");
            return StatusCode(500, ex);
        }
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
