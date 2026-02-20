using HomeCinema.Web.Components;
using HomeCinema.Shared.Services;
using HomeCinema.Web.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Device-specific services
builder.Services.AddSingleton<IFormFactor, FormFactor>();
builder.Services.AddSingleton<IMediaLibraryService, WebMediaLibraryService>();
builder.Services.AddScoped<IPlaybackHistoryService, WebPlaybackHistoryService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode()
    .AddAdditionalAssemblies(
        typeof(HomeCinema.Shared._Imports).Assembly);

app.Run();
