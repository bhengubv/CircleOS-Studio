namespace HomeCinema.Shared.Models;

/// <summary>
/// Represents a single media file — local or network stream.
///
/// NOTE FOR CONTRIBUTORS:
/// This model has a native Java equivalent in the CircleOS repo at:
///   vendor/circle/apps/HomeCinema/src/za/co/circleos/homecinema/MediaItem.java
/// Keep both in sync when adding or changing fields.
/// </summary>
public class MediaItem
{
    public string Id       { get; set; } = string.Empty;
    public string Uri      { get; set; } = string.Empty;
    public string Title    { get; set; } = string.Empty;
    public long   DurationMs  { get; set; }
    public long   SizeBytes   { get; set; }
    public string MimeType { get; set; } = string.Empty;
    public string? ArtUri  { get; set; }
    public string? Artist  { get; set; }
    public string? Album   { get; set; }
    public bool IsNetworkStream { get; set; }

    public bool IsVideo => MimeType.StartsWith("video/", StringComparison.OrdinalIgnoreCase) || IsNetworkStream;
    public bool IsAudio => MimeType.StartsWith("audio/", StringComparison.OrdinalIgnoreCase);

    public string DurationString
    {
        get
        {
            if (DurationMs <= 0) return "--:--";
            var ts = TimeSpan.FromMilliseconds(DurationMs);
            return ts.Hours > 0
                ? $"{ts.Hours}:{ts.Minutes:D2}:{ts.Seconds:D2}"
                : $"{ts.Minutes:D2}:{ts.Seconds:D2}";
        }
    }

    public string SizeString => SizeBytes switch
    {
        >= 1024L * 1024 * 1024 => $"{SizeBytes / (1024.0 * 1024 * 1024):F1} GB",
        >= 1024 * 1024          => $"{SizeBytes / (1024.0 * 1024):F1} MB",
        > 0                     => $"{SizeBytes / 1024.0:F0} KB",
        _                       => string.Empty,
    };
}
