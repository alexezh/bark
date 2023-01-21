using System.Text.Json;

public class ImageAtlas
{
  public string id { get; set; }
  public string url { get; set; }
  public int gridWidth { get; set; }
  public int gridHeight { get; set; }
  public int cellWidth { get; set; }
  public int cellHeight { get; set; }
  public int startTileId { get; set; }

  internal int numTiles => gridWidth * gridHeight;
}

public class ImageAtlasCollection
{
  private readonly Dictionary<string, ImageAtlas> _atlases = new Dictionary<string, ImageAtlas>();
  private EntityDb _db;
  public const string EntityKind = "ImageAtlas";

  public IEnumerable<ImageAtlas> Atlases => _atlases.Select(x => x.Value);

  public ImageAtlasCollection(EntityDb db)
  {
    _db = db;
  }

  public void Add(ImageAtlas atlas)
  {
    _atlases.Add(atlas.id, atlas);
    _db.InsertEntity(EntityKind, atlas.id, atlas);
  }

  public bool TryGet(string id, out ImageAtlas atlas)
  {
    return _atlases.TryGetValue(id, out atlas);
  }

  public void Save(ImageAtlas atlas)
  {
    string s = JsonSerializer.Serialize(atlas);
    // DbUtils.UpdateEntity(EntityKind, atlas.id, s);
  }

  internal void Load()
  {
    var atlaseBlobs = _db.LoadEntities(EntityKind);
    foreach (var blob in atlaseBlobs)
    {
      var atlas = WorldDbStatics.DeserializeEntity<ImageAtlas>(blob);
      _atlases.Add(atlas.id, atlas);
    }
  }

  // return list of ImageAtlas
  // for now we assume that resources are available from static service
  internal object ToWire()
  {
    return _atlases.Values.ToList();
  }
}

