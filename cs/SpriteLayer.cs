public class SpriteLayer : IWorldLayer
{
  private readonly EntityDb _db;
  private readonly StorageLayerProps _props;
  public const string EntityKind = "SpriteLayer";

  public StorageLayerProps Props => _props;

  internal SpriteLayer(EntityDb db, StorageLayerProps props)
  {
    _db = db;
    _props = props;
  }

  public LayerLoadResult Load()
  {
    return LayerLoadResult.Loaded;
  }

  public MapLayerData ToStorage()
  {
    return new MapLayerData()
    {
      props = _props
    };
  }

  public WireMapLayerData ToWire()
  {
    return new WireMapLayerData()
    {
      props = _props
    };
  }
}
