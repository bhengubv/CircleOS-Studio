using System.Text.Json;
using HomeCinema.Shared.Services;

namespace HomeCinema.Services;

/// <summary>
/// MAUI implementation of IPlaybackHistoryService.
/// Persists playback positions and recent network streams using MAUI Preferences.
///
/// NOTE FOR CONTRIBUTORS:
/// The native Android equivalent is PlaybackHistory.java in the CircleOS repo at:
///   vendor/circle/apps/HomeCinema/src/za/co/circleos/homecinema/PlaybackHistory.java
/// That version uses SQLite; this version uses Preferences for cross-platform simplicity.
/// </summary>
public class MauiPlaybackHistoryService : IPlaybackHistoryService
{
    private const string PositionKeyPrefix = "hc_pos_";
    private const string RecentStreamsKey  = "hc_recent_streams";

    public Task SavePositionAsync(string uri, string title, long positionMs)
    {
        Preferences.Default.Set(PositionKeyPrefix + HashKey(uri), positionMs);
        return Task.CompletedTask;
    }

    public Task<long> GetPositionAsync(string uri)
    {
        var pos = Preferences.Default.Get(PositionKeyPrefix + HashKey(uri), 0L);
        return Task.FromResult(pos);
    }

    public Task ClearPositionAsync(string uri)
    {
        Preferences.Default.Remove(PositionKeyPrefix + HashKey(uri));
        return Task.CompletedTask;
    }

    public Task SaveNetworkStreamAsync(string uri)
    {
        var list = LoadRecentList();
        list.Remove(uri);
        list.Insert(0, uri);
        if (list.Count > 30) list.RemoveRange(30, list.Count - 30);
        Preferences.Default.Set(RecentStreamsKey, JsonSerializer.Serialize(list));
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<string>> GetRecentNetworkStreamsAsync(int limit = 10)
    {
        var list = LoadRecentList().Take(limit).ToList();
        return Task.FromResult<IReadOnlyList<string>>(list);
    }

    private static List<string> LoadRecentList()
    {
        var json = Preferences.Default.Get(RecentStreamsKey, "[]");
        return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
    }

    private static string HashKey(string uri) => uri.GetHashCode().ToString("X8");
}
