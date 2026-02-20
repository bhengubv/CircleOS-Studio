using HomeCinema.Shared.Models;

namespace HomeCinema.Shared.Services;

/// <summary>
/// Abstraction for scanning the device media library.
///
/// NOTE FOR CONTRIBUTORS:
/// The native Android implementation lives in the CircleOS repo at:
///   vendor/circle/apps/HomeCinema/src/za/co/circleos/homecinema/MediaLibrary.java
/// The MAUI shell injects MauiMediaLibraryService (queries Android MediaStore).
/// Keep query logic and sort order in sync with the native version.
/// </summary>
public interface IMediaLibraryService
{
    Task<IReadOnlyList<MediaItem>> GetVideosAsync(CancellationToken ct = default);
    Task<IReadOnlyList<MediaItem>> GetAudioAsync(CancellationToken ct = default);
}
