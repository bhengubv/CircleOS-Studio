using Microsoft.Extensions.Logging;
using HomeCinema.Shared.Services;
using HomeCinema.Services;

namespace HomeCinema;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            });

        // Device-specific services
        builder.Services.AddSingleton<IFormFactor, FormFactor>();
        builder.Services.AddSingleton<IMediaLibraryService, MauiMediaLibraryService>();
        builder.Services.AddSingleton<IPlaybackHistoryService, MauiPlaybackHistoryService>();

        builder.Services.AddMauiBlazorWebView();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
