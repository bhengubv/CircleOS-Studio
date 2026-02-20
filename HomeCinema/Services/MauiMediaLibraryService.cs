using HomeCinema.Shared.Models;
using HomeCinema.Shared.Services;

namespace HomeCinema.Services;

/// <summary>
/// MAUI implementation of IMediaLibraryService.
/// On Android: queries MediaStore.Video and MediaStore.Audio.
/// On other platforms: returns an empty list (use network streams instead).
///
/// NOTE FOR CONTRIBUTORS:
/// The native Android logic mirrors MediaLibrary.java in the CircleOS repo at:
///   vendor/circle/apps/HomeCinema/src/za/co/circleos/homecinema/MediaLibrary.java
/// Keep query columns and sort order in sync.
/// </summary>
public class MauiMediaLibraryService : IMediaLibraryService
{
    public Task<IReadOnlyList<MediaItem>> GetVideosAsync(CancellationToken ct = default)
    {
#if ANDROID
        return Task.Run(() => QueryAndroid(
            Android.Provider.MediaStore.Video.Media.ExternalContentUri!,
            "video/"), ct);
#else
        return Task.FromResult<IReadOnlyList<MediaItem>>(Array.Empty<MediaItem>());
#endif
    }

    public Task<IReadOnlyList<MediaItem>> GetAudioAsync(CancellationToken ct = default)
    {
#if ANDROID
        return Task.Run(() => QueryAndroid(
            Android.Provider.MediaStore.Audio.Media.ExternalContentUri!,
            "audio/"), ct);
#else
        return Task.FromResult<IReadOnlyList<MediaItem>>(Array.Empty<MediaItem>());
#endif
    }

#if ANDROID
    private static IReadOnlyList<MediaItem> QueryAndroid(Android.Net.Uri contentUri, string mimePrefix)
    {
        var results = new List<MediaItem>();
        var context = Android.App.Application.Context;

        var projection = new[]
        {
            Android.Provider.MediaStore.MediaColumns.Id,
            Android.Provider.MediaStore.MediaColumns.DisplayName,
            Android.Provider.MediaStore.MediaColumns.Data,
            Android.Provider.MediaStore.MediaColumns.Duration,
            Android.Provider.MediaStore.MediaColumns.Size,
            Android.Provider.MediaStore.MediaColumns.MimeType,
        };

        var sortOrder = $"{Android.Provider.MediaStore.MediaColumns.DisplayName} COLLATE NOCASE ASC";

        using var cursor = context.ContentResolver?.Query(contentUri, projection, null, null, sortOrder);
        if (cursor is null) return results;

        int idxId       = cursor.GetColumnIndexOrThrow(Android.Provider.MediaStore.MediaColumns.Id);
        int idxName     = cursor.GetColumnIndexOrThrow(Android.Provider.MediaStore.MediaColumns.DisplayName);
        int idxData     = cursor.GetColumnIndexOrThrow(Android.Provider.MediaStore.MediaColumns.Data);
        int idxDuration = cursor.GetColumnIndexOrThrow(Android.Provider.MediaStore.MediaColumns.Duration);
        int idxSize     = cursor.GetColumnIndexOrThrow(Android.Provider.MediaStore.MediaColumns.Size);
        int idxMime     = cursor.GetColumnIndexOrThrow(Android.Provider.MediaStore.MediaColumns.MimeType);

        while (cursor.MoveToNext())
        {
            var id       = cursor.GetString(idxId)   ?? string.Empty;
            var name     = cursor.GetString(idxName)  ?? "Unknown";
            var data     = cursor.GetString(idxData)  ?? string.Empty;
            var duration = cursor.GetLong(idxDuration);
            var size     = cursor.GetLong(idxSize);
            var mime     = cursor.GetString(idxMime)  ?? mimePrefix;

            results.Add(new MediaItem
            {
                Id         = id,
                Uri        = $"file://{data}",
                Title      = Path.GetFileNameWithoutExtension(name),
                DurationMs = duration,
                SizeBytes  = size,
                MimeType   = mime,
            });
        }

        return results;
    }
#endif
}
