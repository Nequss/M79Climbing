﻿using System.Net.Sockets;
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
        while (true) // Reconnection loop
        {
            try
            {
                var ipAddress = (await Dns.GetHostAddressesAsync(_dockerHostname)).FirstOrDefault();
                using (var client = new TcpClient())
                {
                    await client.ConnectAsync(ipAddress, _port);
                    OnMessageReceived?.Invoke("Connected!");

                    using (var stream = client.GetStream())
                    using (var reader = new StreamReader(stream, Encoding.UTF8))
                    using (var writer = new StreamWriter(stream, Encoding.UTF8) { AutoFlush = true })
                    {
                        // Send authentication
                        await writer.WriteLineAsync(Environment.GetEnvironmentVariable("SOLDAT_ADMIN_PASSWORD"));
                        OnMessageReceived?.Invoke("Sent authentication");

                        // Send initial status command
                        await writer.WriteLineAsync("=== status");
                        OnMessageReceived?.Invoke("Sent status command");

                        // Read responses
                        string message;
                        while ((message = await reader.ReadLineAsync()) != null)
                        {
                            OnMessageReceived?.Invoke(message.TrimEnd());
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                OnMessageReceived?.Invoke($"Error: {ex.Message}");
                await Task.Delay(5000); // Wait 5 seconds before reconnecting
            }
        }
    }
}