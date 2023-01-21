public class WireFetchFilesRequest
{
  public string pattern { get; set; }
}
public class WireFile
{
  public string name { get; set; }
  public string data { get; set; }
}

public class FileCollection
{
  private readonly Dictionary<string, string> _lib = new Dictionary<string, string>();
  private EntityDb _db;
  public const string EntityKind = "Code";

  public FileCollection(EntityDb db)
  {
    _db = db;
  }

  public IEnumerable<WireFile> FetchFiles(string pattern)
  {
    // for now we only accept * pattern
    if (pattern.Length > 0 && pattern[pattern.Length - 1] == '*')
    {
      string prefix = pattern.Substring(0, pattern.Length - 1);
      foreach (var e in _lib)
      {
        if (e.Key.StartsWith(prefix))
        {
          yield return new WireFile() { name = e.Key, data = e.Value };
        }
      }
    }
    else
    {
      if (_lib.TryGetValue(pattern, out var val))
      {
        yield return new WireFile() { name = pattern, data = val };
      }
    }
  }

  public void StoreFile(string name, string data)
  {
    if (_lib.TryGetValue(name, out var existing))
    {
      if (!_db.TryUpdateEntityRaw(EntityKind, name + ".bak", existing))
      {
        _db.InsertEntityRaw(EntityKind, name + ".bak", existing);
      }
    }

    _lib[name] = data;
    _db.UpdateEntityRaw(EntityKind, name, data);
  }

  public void Load()
  {
    var blobs = _db.LoadEntities2(EntityKind);
    foreach (var blob in blobs)
    {
      if (false && (blob.Item1.StartsWith("avatar/") || blob.Item1.StartsWith("pokedex/")))
      {
        var data = WorldDbStatics.DeserializeEntity<string>(blob.Item2);
        if (data == null)
        {
          data = "";
        }

        _db.UpdateEntityRaw(EntityKind, blob.Item1, data);
        _lib.Add(blob.Item1, data);

      }
      else
      {
        _lib.Add(blob.Item1, blob.Item2);
      }
    }
  }

  public bool TryGet(string name, out string data)
  {
    return _lib.TryGetValue(name, out data);
  }
}

