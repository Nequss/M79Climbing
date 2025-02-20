using System.ComponentModel.DataAnnotations;

namespace M79Climbing.Models
{
    public class Cap
    {
        public int Id { get; set; }

        public string Ip { get; set; } = string.Empty;

        public string Name { get; set; } = string.Empty;

        public string Map { get; set; } = string.Empty;

        public int Time { get; set; }

        [DataType(DataType.Date)]
        public DateTime CapDate { get; set; }
    }
}