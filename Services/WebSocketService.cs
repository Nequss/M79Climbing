using System.Net.WebSockets;
using System.Text;

namespace M79Climbing.Services
{
    public class WebSocketService
    {
        private readonly Dictionary<string, List<WebSocket>> _channelClients = new();
        private readonly object _lock = new();
        private readonly ILogger<WebSocketService> _logger;

        public WebSocketService(ILogger<WebSocketService> logger)
        {
            _logger = logger;
        }

        public void AddClient(string channel, WebSocket webSocket)
        {
            lock (_lock)
            {
                if (!_channelClients.ContainsKey(channel))
                {
                    _channelClients[channel] = new List<WebSocket>();
                }
                _channelClients[channel].Add(webSocket);
                _logger.LogInformation($"Client connected to channel {channel}. Total clients in channel: {_channelClients[channel].Count}");
            }
        }

        public void RemoveClient(string channel, WebSocket webSocket)
        {
            lock (_lock)
            {
                if (_channelClients.ContainsKey(channel))
                {
                    _channelClients[channel].Remove(webSocket);
                    _logger.LogInformation($"Client disconnected from channel {channel}. Total clients in channel: {_channelClients[channel].Count}");
                }
            }
        }

        public async Task BroadcastToChannel(string channel, string message)
        {
            var deadSockets = new List<WebSocket>();
            var buffer = Encoding.UTF8.GetBytes(message);

            lock (_lock)
            {
                if (!_channelClients.ContainsKey(channel)) return;

                foreach (var client in _channelClients[channel])
                {
                    try
                    {
                        if (client.State == WebSocketState.Open)
                        {
                            _ = client.SendAsync(
                                new ArraySegment<byte>(buffer),
                                WebSocketMessageType.Text,
                                true,
                                CancellationToken.None);
                        }
                        else
                        {
                            deadSockets.Add(client);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error sending message to client in channel {channel}: {ex.Message}");
                        deadSockets.Add(client);
                    }
                }

                // Clean up dead connections
                foreach (var socket in deadSockets)
                {
                    _channelClients[channel].Remove(socket);
                }
            }
        }

        public async Task HandleWebSocketConnection(string channel, WebSocket webSocket)
        {
            try
            {
                AddClient(channel, webSocket);

                var buffer = new byte[1024];
                while (webSocket.State == WebSocketState.Open)
                {
                    try
                    {
                        var result = await webSocket.ReceiveAsync(
                            new ArraySegment<byte>(buffer),
                            CancellationToken.None);

                        if (result.MessageType == WebSocketMessageType.Close)
                        {
                            await webSocket.CloseAsync(
                                WebSocketCloseStatus.NormalClosure,
                                "Closing",
                                CancellationToken.None);
                            break;
                        }
                    }
                    catch (WebSocketException ex)
                    {
                        _logger.LogWarning($"WebSocket error in channel {channel}: {ex.Message}");
                        break;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in WebSocket communication for channel {channel}: {ex.Message}");
            }
            finally
            {
                RemoveClient(channel, webSocket);
                if (webSocket.State != WebSocketState.Closed)
                {
                    try
                    {
                        await webSocket.CloseAsync(
                            WebSocketCloseStatus.NormalClosure,
                            "Closing",
                            CancellationToken.None);
                    }
                    catch { /* Ignore any errors during forced closure */ }
                }
            }
        }
    }
}
