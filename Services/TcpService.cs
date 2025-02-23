using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace M79Climbing.Services
{
    public class TcpService
    {
        /* DEBUG
        private readonly int _port = 5000;
        private readonly IPAddress _ipAddress = IPAddress.Loopback;
        */

        private readonly int _port = 23073;
        private readonly string _dockerHostname = "soldat_server"; //docker

        public delegate void MessageReceivedHandler(string message);
        public event MessageReceivedHandler OnMessageReceived;

        public TcpService()
        {
            Task.Run(StartListening);
        }

        private async Task StartListening()
        {
            try
            {
                var ipAddress = (await Dns.GetHostAddressesAsync(_dockerHostname)).FirstOrDefault();

                //DEBUG var listener = new TcpListener(_ipAddress, _port);

                var listener = new TcpListener(ipAddress, _port);
                listener.Start();

                while (true)
                {
                    var client = await listener.AcceptTcpClientAsync();
                    _ = HandleClientAsync(client);
                }
            }
            catch (Exception ex)
            {
                OnMessageReceived?.Invoke(ex.ToString());
            }
        }

        private async Task HandleClientAsync(TcpClient client)
        {
            try
            {
                using (var stream = client.GetStream())
                using (var reader = new StreamReader(stream, Encoding.UTF8))
                {
                    string message;
                    while ((message = await reader.ReadLineAsync()) != null)
                    {
                        OnMessageReceived?.Invoke(message.TrimEnd());
                    }
                }
            }
            finally
            {
                client.Dispose();
            }
        }
    }
}
