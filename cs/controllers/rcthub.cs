using System.Text.Json;
using Microsoft.AspNetCore.SignalR;

public class RctUpdateAvatarPosition
{
  public string worldId { get; set; }
  public string avatarId { get; set; }
  public GridPos newPos { get; set; }
  public GridPos oldPos { get; set; }
}

public class RctHub : Hub
{
  public async Task SendUpdate(string user, string message)
  {
    Console.WriteLine("Received message " + user);
    await Clients.All.SendAsync("OnUpdate", user, message);
  }
  public async Task UpdateAvatarPosition(string sessionId, string message)
  {
    RctUpdateAvatarPosition msg = JsonSerializer.Deserialize<RctUpdateAvatarPosition>(message);

    World world = WorldCollection.Instance.GetWorld(msg.worldId);
    if (world == null)
    {
      return;
    }

    world.Avatars.UpdatePosition(msg);

    await Clients.All.SendAsync("OnUpdateAvatarPosition", sessionId, message);
  }
}
