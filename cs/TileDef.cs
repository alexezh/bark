using System.Text.Json.Serialization;

public class WireTileDef
{
  [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
  public string atlasId { get; set; }
  [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
  public int x { get; set; }
  [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
  public int y { get; set; }
  [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
  public int idx { get; set; }
  public int id { get; set; }
  [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
  public int baseTile { get; set; }
  [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault)]
  public int addOnTile { get; set; }
  [System.Text.Json.Serialization.JsonIgnore(Condition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull)]
  public Dictionary<string, bool> categories { get; set; }
}

public class WireAddCompositeTileResponse
{
  public int tileId { get; set; }
}

public class WireTileBuffer
{
  public string id { get; set; }
  public int width { get; set; }
  public int height { get; set; }
  public string[] tags { get; set; }
  public int[] tileIds { get; set; }
}

public class TileBufferCollectionData
{
  public List<WireTileBuffer> buffers { get; set; }
}

public class TileCollectionData
{
  public List<WireTileDef> tiles { get; set; }
}

// manages IDs for tiles
// IDs are assigned as we add imageatlas
public class TileCollection
{
  private readonly Dictionary<int, WireTileDef> _tiles = new Dictionary<int, WireTileDef>();
  private readonly EntityDb _db;
  private int _nextId = 1;
  public const string EntityKind = "Tile";
  public int NextId => _nextId;

  public TileCollection(EntityDb db)
  {
    _db = db;
  }

  internal void Load(ImageAtlasCollection atlasColl)
  {
    bool updateStorage = false;
    var restamp = new List<WireTileDef>();
    var props = _db.LoadEntity<TileCollectionData>(EntityKind, "0");
    foreach (var tile in props.tiles)
    {
      if (_tiles.ContainsKey(tile.id))
      {
        restamp.Add(tile);
      }
      else
      {
        _tiles[tile.id] = tile;
        /*
                if (tile.idx == 0 && (tile.x != 0 || tile.y != 0))
                {
                  if (!atlasColl.TryGet(tile.atlasId, out var atlas))
                  {
                    throw new ArgumentException();
                  }

                  tile.idx = tile.y * atlas.gridWidth + tile.x;
                  updateStorage = true;
                }
        */
        if (_nextId < tile.id)
        {
          _nextId = tile.id + 1;
        }
      }
    }

    if (updateStorage)
    {
      Save();
    }
  }

  internal void AddTile(string atlasId, int x, int y)
  {
    int id = _nextId++;
    _tiles[id] = new WireTileDef() { atlasId = atlasId, x = x, y = y, id = id };
  }

  internal int AddCompositeTile(WireTileDef tileDef)
  {
    tileDef.id = _nextId;
    _nextId = _nextId + 1;
    _tiles[tileDef.id] = tileDef;
    Save();
    return tileDef.id;
  }

  internal void UpdateTile(WireTileDef tileDef)
  {
    _tiles[tileDef.id] = tileDef;
    Save();
  }

  internal void Save()
  {
    var props = ToProps();
    if (!_db.TryUpdateEntity<TileCollectionData>(EntityKind, "0", props))
    {
      _db.InsertEntity<TileCollectionData>(EntityKind, "0", props);
    }
  }

  private TileCollectionData ToProps()
  {
    return new TileCollectionData()
    {
      tiles = _tiles.Values.ToList()
    };
  }

  internal object ToWire()
  {
    return ToProps();
  }
}


// manages IDs for tiles
// IDs are assigned as we add imageatlas
public class TileBufferCollection
{
  private readonly List<WireTileBuffer> _buffers = new List<WireTileBuffer>();
  private readonly EntityDb _db;
  public const string EntityKind = "TileBuffer";

  public TileBufferCollection(EntityDb db)
  {
    _db = db;
  }

  internal void Load()
  {
    var props = _db.LoadEntity<TileBufferCollection>(EntityKind, "0");
    foreach (var buffer in props._buffers)
    {
      _buffers.Add(buffer);
    }
  }

  internal void AddTileBuffer(WireTileBuffer buffer)
  {
    _buffers.Add(buffer);
  }

  internal void Save()
  {
    var props = ToProps();
    if (!_db.TryUpdateEntity<TileBufferCollectionData>(EntityKind, "0", props))
    {
      _db.InsertEntity<TileBufferCollectionData>(EntityKind, "0", props);
    }
  }

  private TileBufferCollectionData ToProps()
  {
    return new TileBufferCollectionData()
    {
      buffers = _buffers
    };
  }

  internal object ToWire()
  {
    return ToProps();
  }
}