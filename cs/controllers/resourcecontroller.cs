using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace nomekopsrv.Controllers;

public class ResourceController : Controller
{
  [HttpGet]
  public JsonResult GetAtlases(string id)
  {
    World world = WorldCollection.Instance.GetWorld(id);
    if (world == null)
    {
      return Json("Unknown world");
    }
    return Json(world.AtlasColl.ToWire());
  }

  [HttpGet]
  public JsonResult GetTiles(string id)
  {
    World world = WorldCollection.Instance.GetWorld(id);
    if (world == null)
    {
      return Json("Unknown world");
    }
    return Json(world.TileColl.ToWire());
  }

  [HttpPost]
  public async Task<WireAddCompositeTileResponse> AddCompositeTile(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireTileDef tileDef = JsonSerializer.Deserialize<WireTileDef>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return new WireAddCompositeTileResponse() { tileId = 0 };
      }

      var tileId = world.TileColl.AddCompositeTile(tileDef);
      return new WireAddCompositeTileResponse() { tileId = tileId };
    }
  }

  [HttpPost]
  public async Task<string> AddTileSet(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      ImageAtlas tileSet = JsonSerializer.Deserialize<ImageAtlas>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return "Unknown world";
      }

      world.AddAtlas(tileSet, true);
    }

    return "OK";
  }

  [HttpPost]
  public async Task<string> AddTileBuffer(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireTileBuffer tileBuf = JsonSerializer.Deserialize<WireTileBuffer>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return "Unknown world";
      }

      world.TileBufferColl.AddTileBuffer(tileBuf);
    }

    return "OK";
  }

  [HttpPost]
  public async Task<string> UpdateTile(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireTileDef tileDef = JsonSerializer.Deserialize<WireTileDef>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return "Unknown world";
      }

      world.TileColl.UpdateTile(tileDef);
    }

    return "OK";
  }

  [HttpPost]
  public async Task<IEnumerable<WireFile>> FetchFiles(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireFetchFilesRequest fetch = JsonSerializer.Deserialize<WireFetchFilesRequest>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        throw new ArgumentException("Unknown world");
      }

      return world.FileColl.FetchFiles(fetch.pattern);
    }
  }

  [HttpPost]
  public async Task<string> StoreFile(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireFile code = JsonSerializer.Deserialize<WireFile>(content);

      World world = WorldCollection.Instance.GetWorld(id);
      if (world == null)
      {
        return "Unknown world";
      }

      world.FileColl.StoreFile(code.name, code.data);
    }

    return "OK";
  }
}