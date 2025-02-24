using M79Climbing.Data;
using M79Climbing.Models;
using M79Climbing.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System.Net.WebSockets;
using System.Text;
using System.Threading.Tasks;

namespace M79Climbing.Controllers
{
    public class ServerInfoController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly TcpService _tcpService;
        private readonly WebSocketService _webSocketService;
        private M79ClimbingContext _context;

        private static bool _isSubscribed = false;
        private const string CHANNEL = "ServerInfo"; // Define channel name as constant

        public ServerInfoController
        (
            HttpClient httpClient, 
            TcpService tcpService,
            WebSocketService webSocketService,
            M79ClimbingContext context
        )
        {
            _httpClient = httpClient;
            _tcpService = tcpService;
            _webSocketService = webSocketService;
            _context = context;

            if (!_isSubscribed)
            {
                _tcpService.OnMessageReceived += HandleTCPMessagesServerInfo;
                _isSubscribed = true;
            }
        }

        private async void HandleTCPMessagesServerInfo(string message)
        {
            // Check if it's a highscore message
            if (message.StartsWith("H$"))
            {
                try
                {
                    string[] parts = message.Split(',');
                    if (parts.Length >= 5)
                    {
                        var cap = new Cap
                        {
                            Ip = parts[1],
                            Name = parts[2],
                            Map = parts[3],
                            Time = int.Parse(parts[4]),
                            CapDate = DateTime.Now
                        };

                        _context.Cap.Add(cap);
                        await _context.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error saving highscore: {ex.Message}");
                }
            }
            else
                await _webSocketService.BroadcastToChannel(CHANNEL, message);
        }

        [Route("/ServerInfo/WebSocketEndpoint")]

        public async Task WebSocketEndpoint()
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                using var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                await _webSocketService.HandleWebSocketConnection(CHANNEL, webSocket);
            }
            else
            {
                HttpContext.Response.StatusCode = 400;
            }
        }

        [Authorize(Policy = "AdminOnly")]
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] ChatLogMessage message)
        {
            try
            {
                if (message == null || string.IsNullOrEmpty(message.Message))
                {
                    return BadRequest("Message cannot be empty");
                }

                Console.WriteLine($"Attempting to broadcast: {message.Message}");
                await _tcpService.SendCommandAsync(message.Message);
                Console.WriteLine("Broadcast successful");
                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error processing message: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Server error: {ex.Message}");
            }
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
