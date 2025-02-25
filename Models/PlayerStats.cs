using System.ComponentModel.DataAnnotations;

namespace M79Climbing.Models
{
    public class PlayerStats
    {
        public int Id { get; set; }

        public string Ip { get; set; }

        public string Name { get; set; }

        public int GrenadesThrown { get; set; }

        public int M79ShotsFired { get; set; }

        public TimeSpan TimeSpentOnServer { get; set; }

        public int MapFinishes { get; set; } //Sike, actualy server visits by a a player

        public int Respawns { get; set; }
    }
}
