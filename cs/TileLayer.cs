public class GridRect
{
  public int x { get; set; }
  public int y { get; set; }
  public int w { get; set; }
  public int h { get; set; }
}

public class TileLayerSegment
{
  public int id { get; set; }
  public GridRect rect { get; set; }
  public int[] tiles { get; set; }

  public int[] CopyRegion(GridRect reg)
  {
    int[] regTiles = new int[reg.w * reg.h];
    int pos = 0;

    if (tiles == null)
    {
      return null;
    }

    for (int i = 0; i < reg.h; i++)
    {
      for (int j = 0; j < reg.w; j++)
      {
        int v = tiles[(reg.y + i) * rect.w + reg.x + j];
        regTiles[pos] = v;
        pos++;
      }
    }

    return regTiles;
  }
}

public class TileLayer : IWorldLayer
{
  private readonly EntityDb _db;
  private StorageTileLayerProps _props;
  private TileLayerSegment[] _segments;
  public const string EntityKind = "MapSegment";

  public StorageLayerProps Props => _props;

  internal TileLayer(EntityDb db, StorageTileLayerProps props)
  {
    _db = db;
    _props = props;
    _segments = new TileLayerSegment[_props.numSegments];
  }

  public LayerLoadResult Load()
  {
    LayerLoadResult result = LayerLoadResult.Loaded;
    int segments = _props.numSegments;

    for (int i = 0; i < segments; i++)
    {
      var segment = _db.LoadEntity<TileLayerSegment>(EntityKind, GetSegmentKey(i));
      _segments[i] = segment;
    }

    if (_props.segmentHeight == 100)
    {
      StorageTileLayerProps newProps = new StorageTileLayerProps()
      {
        id = _props.id,
        gridWidth = _props.gridWidth,
        gridHeight = _props.gridHeight,
        cellHeight = _props.cellHeight,
        cellWidth = _props.cellWidth,

        pxX = _props.pxX,
        pxY = _props.pxY,
        pxWidth = _props.pxWidth,
        pxHeight = _props.pxHeight,

        segmentHeight = 20,
        segmentWidth = 20
      };

      var newSegments = new TileLayerSegment[newProps.numSegments];

      for (int i = 0; i < segments; i++)
      {
        var bigSegment = _segments[i];
        for (int y = 0; y < 5; y++)
        {
          for (int x = 0; x < 5; x++)
          {
            var smallRect = new GridRect()
            {
              x = bigSegment.rect.x + x * 20,
              y = bigSegment.rect.y + y * 20,
              w = 20,
              h = 20,
            };

            var smallSegment = new TileLayerSegment()
            {
              rect = smallRect,
              id = newProps.GetSegmentIndex(smallRect.x, smallRect.y),
              tiles = bigSegment.CopyRegion(new GridRect() { x = x * 20, y = y * 20, w = smallRect.w, h = smallRect.h })
            };

            newSegments[smallSegment.id] = smallSegment;
          }
        }
      }

      for (int i = 0; i < newSegments.Length; i++)
      {
        if (newSegments[i] == null)
        {
          throw new ArgumentException();
        }
      }

      _segments = newSegments;
      _props = newProps;

      for (int i = 0; i < newSegments.Length; i++)
      {
        if (!_db.TryUpdateEntity(EntityKind, GetSegmentKey(i), newSegments[i]))
        {
          _db.InsertEntity(EntityKind, GetSegmentKey(i), newSegments[i]);
        }
      }

      result = LayerLoadResult.Updated;
    }

    return result;
  }

  public void Update(WireTileLayerUpdate updateMsg)
  {
    Dictionary<int, TileLayerSegment> dirty = new Dictionary<int, TileLayerSegment>();

    foreach (var tile in updateMsg.tiles)
    {
      if (tile.x > _props.gridWidth || tile.y > _props.gridHeight)
      {
        throw new ArgumentException();
      }

      var segment = GetSegment(tile.x, tile.y);
      int idx = (tile.y - segment.rect.y) * segment.rect.w + (tile.x - segment.rect.x);
      segment.tiles[idx] = tile.tileId;

      dirty[segment.id] = segment;
    }

    foreach (var item in dirty)
    {
      _db.UpdateEntity(EntityKind, GetSegmentKey(item.Key), item.Value);
    }
  }

  // it is easier to store data as single block but write we serments
  // we are going to create segments dynamically even so it will require allocs
  internal void CreateSegments()
  {
    int segments = _props.numSegments;
    for (int i = 0; i < segments; i++)
    {
      var segment = MakeSegment(i);
      _segments[i] = segment;
      _db.InsertEntity(EntityKind, GetSegmentKey(i), segment);
    }
  }

  private TileLayerSegment GetSegment(int x, int y)
  {
    int idx = _props.GetSegmentIndex(x, y);
    var segment = _segments[idx];
    if (segment.tiles == null)
    {
      segment.tiles = new int[segment.rect.w * segment.rect.h];
    }

    return segment;
  }

  private TileLayerSegment MakeSegment(int i)
  {
    var segment = new TileLayerSegment()
    {
      id = i,
      rect = new GridRect()
      {
        x = (i % _props.numSegmentsX) * _props.segmentWidth,
        y = (i / _props.numSegmentsX) * _props.segmentWidth,
        w = _props.segmentWidth,
        h = _props.segmentHeight,
      },
      tiles = null
    };

    segment.rect = new GridRect() { x = segment.rect.x, y = segment.rect.y, w = segment.rect.w, h = segment.rect.h };

    return segment;
  }

  private string GetSegmentKey(int id)
  {
    return Props.id + "_" + id.ToString();
  }

  public WireMapLayerData ToWire()
  {
    return new WireMapLayerData
    {
      tileProps = _props,
      segments = _segments
    };
  }

  public MapLayerData ToStorage()
  {
    return new MapLayerData()
    {
      tileProps = _props
    };
  }
}
