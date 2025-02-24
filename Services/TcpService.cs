using System.Net.Sockets;
using System.Net;
using System.Text;
using System.IO;

public class TcpService
{
    private readonly int _port = 23073;
    private readonly string _dockerHostname = "soldat_server";

    public delegate void MessageReceivedHandler(string message);
    public event MessageReceivedHandler OnMessageReceived;

    // ... existing code ...

    private TcpClient _client;
    private NetworkStream _stream;
    private bool _isConnected;

    public TcpService()
    {
        _isConnected = false;
        Task.Run(ConnectToServerAsync);
    }

    public async Task SendCommandAsync(string command)
    {
        if (!_isConnected || _stream == null)
        {
            throw new InvalidOperationException("Not connected to server");
        }

        try
        {
            // Ensure command ends with newline
            if (!command.EndsWith("\n"))
            {
                command += "\n";
            }

            byte[] commandBytes = Encoding.UTF8.GetBytes(command);
            await _stream.WriteAsync(commandBytes, 0, commandBytes.Length);
            OnMessageReceived?.Invoke($"Sent command: {command.TrimEnd()}");
        }
        catch (Exception ex)
        {
            OnMessageReceived?.Invoke($"Error sending command: {ex.Message}");
            _isConnected = false;
            throw;
        }
    }

    private async Task ConnectToServerAsync()
    {
        while (true)
        {
            try
            {
                var ipAddress = (await Dns.GetHostAddressesAsync(_dockerHostname)).FirstOrDefault();
                _client = new TcpClient();
                await _client.ConnectAsync(ipAddress, _port);
                _stream = _client.GetStream();
                _isConnected = true;
                OnMessageReceived?.Invoke("Connected!");

                // Send password exactly like the Python code does
                byte[] passwordBytes = Encoding.UTF8.GetBytes($"{Environment.GetEnvironmentVariable("SOLDAT_ADMIN_PASSWORD")}\n");
                await _stream.WriteAsync(passwordBytes, 0, passwordBytes.Length);
                OnMessageReceived?.Invoke("Sent authentication");

                // Send status command
                byte[] statusBytes = Encoding.UTF8.GetBytes("=== status\n");
                await _stream.WriteAsync(statusBytes, 0, statusBytes.Length);
                OnMessageReceived?.Invoke("Sent status command");

                // Read responses
                byte[] buffer = new byte[1024];
                while (true)
                {
                    int bytesRead = await _stream.ReadAsync(buffer, 0, buffer.Length);
                    if (bytesRead == 0) break; // Connection closed

                    string message = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                    foreach (var line in message.Split('\n'))
                    {
                        if (!string.IsNullOrEmpty(line))
                        {
                            OnMessageReceived?.Invoke(line.TrimEnd());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _isConnected = false;
                OnMessageReceived?.Invoke($"Error: {ex.Message}");

                // Clean up resources
                _stream?.Dispose();
                _client?.Dispose();

                await Task.Delay(5000); // Wait before reconnecting
            }
        }
    }

    // Don't forget to implement IDisposable
    public void Dispose()
    {
        _stream?.Dispose();
        _client?.Dispose();
    }
}