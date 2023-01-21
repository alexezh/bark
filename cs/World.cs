using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

public class CommandQueue
{

}

public class WorldProps
{
  public string id { get; set; }
}

public class WireWorldData
{
  public WorldProps props { get; set; }
  public List<string> maps { get; set; }
}

public class MapProps
{
  public string id { get; set; }
  public int gridWidth { get; set; }
  public int gridHeight { get; set; }
  public int segmentWidth { get; set; }
  public int segmentHeight { get; set; }
  public int cellWidth { get; set; }
  public int cellHeight { get; set; }
  public int humanStepDuration { get; set; }
}

public class World
{
  public readonly WorldProps Props;
  private GameDb _db;
  public readonly ImageAtlasCollection AtlasColl;
  public readonly TileCollection TileColl;
  public readonly TileBufferCollection TileBufferColl;
  public readonly AvatarCollection Avatars;
  public readonly FileCollection FileColl;
  public readonly Dictionary<string, GameMap> Maps = new Dictionary<string, GameMap>();
  public const string EntityKind = "World";

  public GameDb Db => _db;

  private World(GameDb db, WorldProps props)
  {
    Props = props;
    _db = db;
    FileColl = new FileCollection(_db.Resources);
    AtlasColl = new ImageAtlasCollection(_db.Resources);
    TileColl = new TileCollection(_db.Resources);
    TileBufferColl = new TileBufferCollection(_db.Resources);
    Avatars = new AvatarCollection(_db.Avatars);
  }

  public static World Create(WorldProps props)
  {
    var gd = new GameDb(props.id);
    gd.World.InsertEntity(EntityKind, "0", props);
    return new World(gd, props);
  }

  public static World Load(string id)
  {
    var db = new GameDb(id);
    var propBlobs = db.World.LoadEntities(EntityKind);
    if (propBlobs.Count == 0)
    {
      throw new ArgumentException();
    }

    var worldProps = WorldDbStatics.DeserializeEntity<WorldProps>(propBlobs[0]);
    var world = new World(db, worldProps);

    world.FileColl.Load();
    world.AtlasColl.Load();
    world.TileColl.Load(world.AtlasColl);
    //world.RebuildTileColl();
    world.Avatars.Load(world.FileColl);
    world.LoadMaps();

    return world;
  }

  private void RebuildTileColl()
  {
    foreach (var atlas in AtlasColl.Atlases)
    {
      BuildTiles(atlas);
      AtlasColl.Save(atlas);
    }

    TileColl.Save();
  }

  private void BuildTiles(ImageAtlas atlas)
  {
    atlas.startTileId = TileColl.NextId;

    for (int i = 0; i < atlas.gridHeight; i++)
    {
      for (int j = 0; j < atlas.gridWidth; j++)
      {
        TileColl.AddTile(atlas.id, j, i);
      }
    }
  }

  private void LoadMaps()
  {
    var mapBlobs = _db.World.LoadEntities(GameMap.EntityKind);
    foreach (var mapBlob in mapBlobs)
    {
      var map = GameMap.Load(mapBlob, _db.World);
      Maps[map.Id] = map;
    }
  }

  public void AddMap(GameMap map)
  {
    Maps[map.Id] = map;
    map.StoreMap();
  }

  public void AddAtlas(ImageAtlas atlas, bool addTiles = false)
  {
    if (AtlasColl.TryGet(atlas.id, out var existingAtlas))
    {
      return;
    }

    atlas.startTileId = TileColl.NextId;
    AtlasColl.Add(atlas);
    if (addTiles)
    {
      BuildTiles(atlas);
      TileColl.Save();
    }
  }

  public WireWorldData ToWire()
  {
    return new WireWorldData()
    {
      props = Props,
      maps = Maps.Select(x => x.Key).ToList()
    };
  }
}

public class WorldCollection
{
  public static WorldCollection Instance = new WorldCollection();
  private const string DemoWorldId = "7fa84179-dc58-4939-8678-03370fd137f3";
  private Dictionary<string, World> _worlds = new Dictionary<string, World>();

  public void Initialize()
  {
    CreateDemo();
  }

  private void CreateDemo()
  {
    if (WorldDbStatics.Exists(DemoWorldId))
    {
      _worlds.Add(DemoWorldId, World.Load(DemoWorldId));
      return;
    }

    // first create DB
    WorldDbStatics.CreateResources();
    WorldDbStatics.CreateCreatures();
    WorldDbStatics.CreateWorld(DemoWorldId);

    // now create world which will populate DB

    var world = World.Create(new WorldProps { id = DemoWorldId });

    world.AddAtlas(new ImageAtlas() { id = "outside3", gridWidth = 8, gridHeight = 146, cellWidth = 32, cellHeight = 32, url = "./assets/tilesets/[Inf]outside3.png" }, addTiles: true);

    var map = new GameMap(new MapProps()
    {
      id = "default",
      gridWidth = 1000,
      gridHeight = 1000,
      segmentWidth = 100,
      segmentHeight = 100,
      cellWidth = 32,
      cellHeight = 32,
      humanStepDuration = 300,
    }, world.Db.World);
    world.AddMap(map);

    map.AddTileLayer(StorageTileLayerProps.FromWorldProps("ground", map.Props));
    map.AddTileLayer(StorageTileLayerProps.FromWorldProps("fences", map.Props));

    _worlds.Add(world.Props.id, world);
  }

  internal World GetWorld(string id)
  {
    World world;
    if (id == null)
    {
      return null;
    }

    _worlds.TryGetValue(id, out world);
    return world;
  }
}
