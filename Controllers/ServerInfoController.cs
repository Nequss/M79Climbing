using M79Climbing.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Net.Http;
using System.Threading.Tasks;

namespace M79Climbing.Controllers
{
    public class ServerInfoController : Controller
    {
        private readonly HttpClient _httpClient;

        public ServerInfoController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<IActionResult> Index()
        {
            var apiUrl = "https://api.soldat.pl/v0/server/34.118.30.26/23073";
            ServerInfoModel serverData = null;

            try
            {
                var response = await _httpClient.GetAsync(apiUrl);
                if (response.IsSuccessStatusCode)
                {
                    var jsonResponse = await response.Content.ReadAsStringAsync();
                    serverData = JsonConvert.DeserializeObject<ServerInfoModel>(jsonResponse);
                }
            }
            catch
            {
                // Handle exceptions (e.g., API down, network issues)
            }

            return View(serverData);
        }
    }
}
