using HomeCinema.Shared.Models;
using HomeCinema.Shared.Services;

namespace HomeCinema.Web.Services;

/// <summary>
/// Web stub for IMediaLibraryService.
/// Browsers cannot access device media libraries, so this always returns an empty list.
/// Users can still play content by adding network stream URLs on the Streams tab.
/// </summary>
public class WebMediaLibraryService : IMediaLibraryService
{
    public Task<IReadOnlyList<MediaItem>> GetVideosAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<MediaItem>>(Array.Empty<MediaItem>());

    public Task<IReadOnlyList<MediaItem>> GetAudioAsync(CancellationToken ct = default)
        => Task.FromResult<IReadOnlyList<MediaItem>>(Array.Empty<MediaItem>());
}
