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
            return RedirectToAction("Edit", new { fileName = "Demo" });

            // return View();
        }

        public async Task<IActionResult> Edit(string fileName)
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

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
                filePath = stream.Name;
            }

            return RedirectToAction("Edit", new { fileName = file.FileName });
        }

        /*
        public async Task<IActionResult> Edit(string fileName)
        {
            if (string.IsNullOrEmpty(fileName))
            {
                return RedirectToAction("Index", new { error = "No file selected" });
            }

            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", fileName);

            // Check if file exists
            if (!System.IO.File.Exists(filePath))
            {
                return RedirectToAction("Index", new { error = "File not found" });
            } 

            PMS_FILE map = await _pmsFileService.ReadPMSFile(filePath);
            return View(map);
        }
        */
    }
}
