using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace nomekopsrv.Controllers;

public class WorldController : Controller
{
  [HttpGet]
  public JsonResult Get(string id)
  {
    World world = WorldCollection.Instance.GetWorld(id);
    if (world == null)
    {
      return Json("Unknown world");
    }
    return Json(world.ToWire());
  }

  [HttpGet]
  public JsonResult GetMap(string id)
  {
    string[] parts = id.Split('!');
    if (parts.Length != 2)
    {
      return Json("Unknown map id");
    }
    World world = WorldCollection.Instance.GetWorld(parts[0]);
    if (world == null)
    {
      return Json("Unknown world");
    }

    if (!world.Maps.TryGetValue(parts[1], out var map))
    {
      return Json("Unknown map");
    }
    return Json(map.ToWire());
  }

  [HttpGet]
  public JsonResult GetAvatars(string id)
  {
    World world = WorldCollection.Instance.GetWorld(id);
    if (world == null)
    {
      return Json("Unknown world");
    }

    return Json(world.Avatars.ToWire());
  }

  [HttpPost]
  public async Task<WireAvatar> SpawnPokemon(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireSpawnPokemonRequest spawnParams = JsonSerializer.Deserialize<WireSpawnPokemonRequest>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        throw new ArgumentException("cannot create");
      }

      return world.Avatars.SpawnPokemon(spawnParams);
    }
  }

  [HttpPost]
  public async Task<WireAvatar> SpawnCharacter(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireSpawnCharacterRequest spawnParams = JsonSerializer.Deserialize<WireSpawnCharacterRequest>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        throw new ArgumentException("cannot create");
      }

      return world.Avatars.SpawnCharacter(spawnParams);
    }
  }

  [HttpPost]
  public async Task<string> UpdateTileLayer(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireTileLayerUpdate updateMsg = JsonSerializer.Deserialize<WireTileLayerUpdate>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return "Unknown world";
      }

      if (!world.Maps.TryGetValue(updateMsg.mapId, out var map))
      {
        return "Unknown map";
      }

      IWorldLayer layer = map.GetLayer(updateMsg.layerId);
      if (layer == null)
      {
        return "Unknown layer";
      }

      TileLayer tileLayer = layer as TileLayer;
      if (tileLayer == null)
      {
        return "Incorrect layer type";
      }

      tileLayer.Update(updateMsg);

      return "OK";
    }
  }

  [HttpPost]
  public async Task<string> UpdateAvatarCode(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireUpdateAvatarCode updateMsg = JsonSerializer.Deserialize<WireUpdateAvatarCode>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return "Unknown world";
      }

      world.Avatars.UpdateCode(updateMsg.avatarId, updateMsg.code);

      return "OK";
    }
  }

  [HttpPost]
  public async Task<string> UpdateAvatarRuntimeProps(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireUpdateRuntimeProps updateMsg = JsonSerializer.Deserialize<WireUpdateRuntimeProps>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return "Unknown world";
      }

      world.Avatars.UpdateRuntimeProps(updateMsg.avatarId, updateMsg.rt);

      return "OK";
    }
  }

  [HttpPost]
  public async Task<string> UpdateMapCode(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireUpdateMapCode updateMsg = JsonSerializer.Deserialize<WireUpdateMapCode>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return "Unknown world";
      }

      if (!world.Maps.TryGetValue(updateMsg.mapId, out var map))
      {
        return "Unknown map";
      }

      map.UpdateCode(updateMsg.category, updateMsg.code);

      return "OK";
    }
  }
}