using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using M79Climbing.Data;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Hosting.StaticWebAssets;
using M79Climbing.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<M79ClimbingContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("M79ClimbingContext") ?? throw new InvalidOperationException("Connection string 'M79ClimbingContext' not found.")));

// Add HttpClient
builder.Services.AddHttpClient();

// Add services to the container.
builder.Services.AddControllersWithViews();

// Add authentication services
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.LoginPath = "/Admin/Login";
        options.AccessDeniedPath = "/Admin/AccessDenied";
    });

// Add authorization policy
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});

// Add TcpService
builder.Services.AddSingleton<TcpService>();

// Add WebSocket 
builder.Services.AddSingleton<WebSocketService>();

var app = builder.Build();

// Ensure database is created at startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<M79ClimbingContext>();
        // Use EnsureCreated instead of Migrate - this will create the database schema
        // based on your entity models without requiring migrations
        context.Database.EnsureCreated();

        // Log success
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Database schema created successfully.");
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating the database.");
    }
}

// Loading/enabling static web assets
StaticWebAssetsLoader.UseStaticWebAssets(app.Environment, app.Configuration);

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapStaticAssets();

app.UseWebSockets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();

app.Run();