using M79Climbing.Models.PMS;
using M79Climbing.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace M79Climbing.Controllers
{
    public class MapEditorController : Controller
    {
        private readonly PMS_File_Service _pmsFileService;

        private string filePath = "";

        public MapEditorController(PMS_File_Service pmsFileService)
        {
            _pmsFileService = pmsFileService;
        }

        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                ViewData["Message"] = "Please select a file.";
                return View("Index");
            }

            // Get the file extension
            var extension = Path.GetExtension(file.FileName);

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsFolder); // Ensure the folder exists

            filePath = Path.Combine(uploadsFolder, file.FileName);
            Console.WriteLine($"File Path: {filePath}");

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return RedirectToAction("Edit");
        }

        public async Task<IActionResult> Edit()
        {
            PMS_FILE map = await _pmsFileService.ReadPMSFile(@"C:\Users\snequ\Documents\Visual Studio 2022 Projects\M79Climbing\wwwroot\uploads\m79_Rushup.pms");

            return View(map);
        }
    }
}
