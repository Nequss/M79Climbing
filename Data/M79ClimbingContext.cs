using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using M79Climbing.Models;

namespace M79Climbing.Data
{
    public class M79ClimbingContext : DbContext
    {
        public M79ClimbingContext (DbContextOptions<M79ClimbingContext> options)
            : base(options)
        {
        }

        public DbSet<M79Climbing.Models.Cap> Cap { get; set; } = default!;
        public DbSet<PlayerStats> PlayerStats { get; set; } = default!;

    }
}
