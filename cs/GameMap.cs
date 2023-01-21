
// store either tile or generic layer
// for json, it is easier to serialize as two separate props
public class MapLayerData
{
  public StorageTileLayerProps tileProps { get; set; }
  public StorageLayerProps props { get; set; }
}

public class MapData
{
  public MapProps props { get; set; }

  public List<MapLayerData> layers { get; set; }
}

public class StorageCodeBlob
{
  public string category { get; set; }

  public string code { get; set; }
}

public class WireUpdateMapCode
{
  public string mapId { get; set; }
  public string category { get; set; }
  public string code { get; set; }
}

public class WireMapLayerData
{
  public StorageTileLayerProps tileProps { get; set; }
  public StorageLayerProps props { get; set; }

  public TileLayerSegment[] segments { get; set; }
}

// same as MapLayerData but passes actual segments
public class WireMapData
{
  public MapProps props { get; set; }

  public Dictionary<string, string> codeLib { get; set; }
  public List<WireMapLayerData> layers { get; set; }
}

public class GameMap
{
  private readonly MapProps _mapProps;
  private readonly EntityDb _db;
  private readonly List<IWorldLayer> _layers = new List<IWorldLayer>();
  private readonly Dictionary<string, IWorldLayer> _layerMap = new Dictionary<string, IWorldLayer>();
  private readonly Dictionary<string, string> _codeLib = new Dictionary<string, string>();
  public const string EntityKind = "WorldMap";
  public const string CodeKind = "MapCode";

  public string Id => _mapProps.id;
  public MapProps Props => _mapProps;

  public GameMap(MapProps props, EntityDb db)
  {
    _mapProps = props;
    _db = db;
  }

  public GameMap(MapData data, EntityDb db)
  {
    _mapProps = data.props;
    _db = db;

    bool needUpdate = false;

    LoadCode();

    // load layers individually
    foreach (var layerData in data.layers)
    {
      IWorldLayer layer;
      if (layerData.tileProps != null)
      {
        layer = new TileLayer(_db, layerData.tileProps);
      }
      else
      {
        layer = new SpriteLayer(_db, layerData.props);
      }

      var loadResut = layer.Load();
      if (loadResut == LayerLoadResult.Updated)
      {
        needUpdate = true;
      }

      _layers.Add(layer);
      _layerMap[layer.Props.id] = layer;
    }

    if (needUpdate)
    {
      StoreMap();
    }
  }

  public TileLayer AddTileLayer(StorageTileLayerProps layerProps)
  {
    var layer = new TileLayer(_db, layerProps);
    layer.CreateSegments();
    _layers.Add(layer);
    _layerMap[layerProps.id] = layer;
    StoreMap();
    return layer;
  }

  public SpriteLayer AddSpriteLayer(StorageLayerProps layerProps)
  {
    var layer = new SpriteLayer(_db, layerProps);
    _layers.Add(layer);
    StoreMap();
    return layer;
  }

  public IWorldLayer GetLayer(string id)
  {
    _layerMap.TryGetValue(id, out var layer);
    return layer;
  }

  public static GameMap Load(string blob, EntityDb db)
  {
    var mapData = WorldDbStatics.DeserializeEntity<MapData>(blob);
    if (mapData == null)
    {
      throw new ArgumentException();
    }

    var map = new GameMap(mapData, db);

    return map;
  }

  private void LoadCode()
  {
    var codeBlobs = _db.LoadEntities(CodeKind);
    foreach (var blob in codeBlobs)
    {
      var code = WorldDbStatics.DeserializeEntity<StorageCodeBlob>(blob);
      _codeLib[code.category] = code.code;
    }
  }

  public void StoreMap()
  {
    var props = new MapData()
    {
      props = _mapProps,
      layers = _layers.Select(x => x.ToStorage()).ToList()
    };

    if (!_db.TryUpdateEntity(EntityKind, Id, props))
    {
      _db.InsertEntity(EntityKind, Id, props);
    }
  }

  internal void UpdateCode(string category, string code)
  {
    _codeLib[category] = code;

    var codeBlob = new StorageCodeBlob()
    {
      category = category,
      code = code
    };

    if (!_db.TryUpdateEntity(CodeKind, category, codeBlob))
    {
      _db.InsertEntity(CodeKind, Id, codeBlob);
    }
  }

  internal WireMapData ToWire()
  {
    return new WireMapData()
    {
      props = Props,
      layers = _layers.Select(x => x.ToWire()).ToList()
    };
  }
}