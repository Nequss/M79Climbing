namespace M79Climbing.Models
{
    public class ServerInfoModel
    {
        public string Version { get; set; }
        public int MaxPlayers { get; set; }
        public int NumBots { get; set; }
        public int BonusFreq { get; set; }
        public int Respawn { get; set; }
        public int ConnectionType { get; set; }
        public int NumPlayers { get; set; }
        public bool Dedicated { get; set; }
        public bool Realistic { get; set; }
        public bool Private { get; set; }
        public bool Survival { get; set; }
        public bool Advanced { get; set; }
        public bool WM { get; set; }
        public bool AC { get; set; }
        public string Name { get; set; }
        public string Country { get; set; }
        public string Info { get; set; }
        public string CurrentMap { get; set; }
        public string OS { get; set; }
        public string GameStyle { get; set; }
        public string IP { get; set; }
        public int Port { get; set; }
    }
}
