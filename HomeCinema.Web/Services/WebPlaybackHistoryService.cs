using HomeCinema.Shared.Services;

namespace HomeCinema.Web.Services;

/// <summary>
/// In-memory IPlaybackHistoryService for the Blazor Web host.
/// State is session-scoped and does not persist across page refreshes.
/// Registered as Scoped so each SignalR circuit gets its own instance.
/// </summary>
public class WebPlaybackHistoryService : IPlaybackHistoryService
{
    private readonly Dictionary<string, long> _positions    = new();
    private readonly List<string>             _recentStreams = new();

    public Task SavePositionAsync(string uri, string title, long positionMs)
    {
        _positions[uri] = positionMs;
        return Task.CompletedTask;
    }

    public Task<long> GetPositionAsync(string uri)
        => Task.FromResult(_positions.GetValueOrDefault(uri));

    public Task ClearPositionAsync(string uri)
    {
        _positions.Remove(uri);
        return Task.CompletedTask;
    }

    public Task SaveNetworkStreamAsync(string uri)
    {
        _recentStreams.Remove(uri);
        _recentStreams.Insert(0, uri);
        if (_recentStreams.Count > 30) _recentStreams.RemoveRange(30, _recentStreams.Count - 30);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<string>> GetRecentNetworkStreamsAsync(int limit = 10)
        => Task.FromResult<IReadOnlyList<string>>(_recentStreams.Take(limit).ToList());
}
