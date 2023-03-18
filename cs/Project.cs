public class WireGetStringsRequest
{
  public string pattern { get; set; }
}
public class WireString
{
  public string name { get; set; }
  public string data { get; set; }
}

public class Project
{
  private readonly Dictionary<string, string> _lib = new Dictionary<string, string>();
  private EntityDb _db;
  public const string EntityKind = "Code";

  public static Project Load(string id)
  {
    var db = new EntityDb(id);
    return new Project(db);
  }

  public Project(EntityDb db)
  {
    _db = db;

    var blobs = _db.LoadEntities2(EntityKind);
    foreach (var blob in blobs)
    {
      _lib.Add(blob.Item1, blob.Item2);
    }
  }

  public IEnumerable<WireString> FetchStrings(string pattern)
  {
    // for now we only accept * pattern
    if (pattern.Length > 0 && pattern[pattern.Length - 1] == '*')
    {
      string prefix = pattern.Substring(0, pattern.Length - 1);
      foreach (var e in _lib)
      {
        if (e.Key.StartsWith(prefix))
        {
          yield return new WireString() { name = e.Key, data = e.Value };
        }
      }
    }
    else
    {
      if (_lib.TryGetValue(pattern, out var val))
      {
        yield return new WireString() { name = pattern, data = val };
      }
    }
  }

  public void SetString(string name, string data)
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

  public bool TryGet(string name, out string data)
  {
    return _lib.TryGetValue(name, out data);
  }
}

