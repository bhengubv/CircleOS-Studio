namespace HomeCinema.Shared.Services;

/// <summary>
/// Persists per-file playback positions and recent network stream URLs.
///
/// NOTE FOR CONTRIBUTORS:
/// The native Android implementation lives in the CircleOS repo at:
///   vendor/circle/apps/HomeCinema/src/za/co/circleos/homecinema/PlaybackHistory.java
/// Schema: files(uri TEXT PK, title TEXT, last_pos_ms INTEGER, last_played_ms INTEGER, play_count INTEGER)
/// Keep schema and method semantics in sync.
/// </summary>
public interface IPlaybackHistoryService
{
    Task SavePositionAsync(string uri, string title, long positionMs);
    Task<long> GetPositionAsync(string uri);
    Task ClearPositionAsync(string uri);
    Task SaveNetworkStreamAsync(string uri);
    Task<IReadOnlyList<string>> GetRecentNetworkStreamsAsync(int limit = 10);
}
