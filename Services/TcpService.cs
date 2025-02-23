using System.Net.Sockets;
using System.Net;
using System.Text;

public class TcpService
{
    private readonly int _port = 23073;
    private readonly string _dockerHostname = "soldat_server";

    public delegate void MessageReceivedHandler(string message);
    public event MessageReceivedHandler OnMessageReceived;

    public TcpService()
    {
        Task.Run(ConnectToServerAsync);
    }

    private async Task ConnectToServerAsync()
    {
        while (true)
        {
            try
            {
                var ipAddress = (await Dns.GetHostAddressesAsync(_dockerHostname)).FirstOrDefault();
                using (var client = new TcpClient())
                {
                    await client.ConnectAsync(ipAddress, _port);
                    OnMessageReceived?.Invoke("Connected!");

                    using (var stream = client.GetStream())
                    {
                        // Send password exactly like the Python code does
                        byte[] passwordBytes = Encoding.UTF8.GetBytes($"{Environment.GetEnvironmentVariable("SOLDAT_ADMIN_PASSWORD")}\n");
                        await stream.WriteAsync(passwordBytes, 0, passwordBytes.Length);
                        OnMessageReceived?.Invoke("Sent authentication");

                        // Send status command
                        byte[] statusBytes = Encoding.UTF8.GetBytes("=== status\n");
                        await stream.WriteAsync(statusBytes, 0, statusBytes.Length);
                        OnMessageReceived?.Invoke("Sent status command");

                        // Read responses
                        byte[] buffer = new byte[1024];
                        while (true)
                        {
                            int bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
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
                }
            }
            catch (Exception ex)
            {
                OnMessageReceived?.Invoke($"Error: {ex.Message}");
                await Task.Delay(5000);
            }
        }
    }
}