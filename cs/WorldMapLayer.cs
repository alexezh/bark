public class StorageLayerProps
{
  public string id { get; set; }
  public int pxX { get; set; }
  public int pxY { get; set; }
  public int pxWidth { get; set; }
  public int pxHeight { get; set; }

  public static StorageLayerProps FromWorldProps(string id, MapProps worldProps = null)
  {
    if (worldProps != null)
    {
      return new StorageLayerProps()
      {
        id = id,
        pxX = 0,
        pxY = 0,
        pxWidth = worldProps.gridWidth * worldProps.cellWidth,
        pxHeight = worldProps.gridHeight * worldProps.cellHeight,
      };
    }
    else
    {
      return new StorageLayerProps()
      {
        id = id
      };
    }
  }
}

public class WireTileUpdate
{
  public int x { get; set; }
  public int y { get; set; }
  public int tileId { get; set; }
}

public class WireTileLayerUpdate
{
  public string mapId { get; set; }
  public string layerId { get; set; }
  public List<WireTileUpdate> tiles { get; set; }
}

public class StorageTileLayerProps : StorageLayerProps
{
  public int gridWidth { get; set; }
  public int gridHeight { get; set; }
  // width of segment (in tiles)
  public int segmentWidth { get; set; }
  // height of segment (in tiles)
  public int segmentHeight { get; set; }
  public int cellWidth { get; set; }
  public int cellHeight { get; set; }

  internal int numTiles => gridWidth * gridHeight;
  // number of segments by X
  internal int numSegmentsX => gridWidth / segmentWidth;
  // number of segments by Y
  internal int numSegmentsY => gridHeight / segmentHeight;
  internal int numSegments => numSegmentsX * numSegmentsY;

  public int GetSegmentIndex(int x, int y)
  {
    int idx = (y / segmentHeight) * numSegmentsX + x / segmentWidth;
    return idx;
  }

  public static StorageTileLayerProps FromWorldProps(string id, MapProps worldProps = null)
  {
    if (worldProps != null)
    {
      return new StorageTileLayerProps()
      {
        id = id,
        pxX = 0,
        pxY = 0,
        pxWidth = worldProps.gridWidth * worldProps.cellWidth,
        pxHeight = worldProps.gridHeight * worldProps.cellHeight,
        cellWidth = worldProps.cellWidth,
        cellHeight = worldProps.cellHeight,
        gridWidth = worldProps.gridWidth,
        gridHeight = worldProps.gridHeight,
        segmentWidth = worldProps.segmentWidth,
        segmentHeight = worldProps.segmentHeight
      };
    }
    else
    {
      return new StorageTileLayerProps()
      {
        id = id
      };
    }
  }
}

public enum LayerLoadResult
{
  Loaded,
  Updated,
}

public interface IWorldLayer
{
  StorageLayerProps Props { get; }
  LayerLoadResult Load();
  MapLayerData ToStorage();
  WireMapLayerData ToWire();
}


