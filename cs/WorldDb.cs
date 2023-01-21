using System.Text.Json;
using Microsoft.Data.Sqlite;

public class WorldDbStatics
{
  public const string resources = "resources";
  public const string creatures = "creatures";

  private static string GetDbPath(string id)
  {
    return $"monekop_{id}.db";
  }

  public static SqliteConnection CreateConnection(string id)
  {
    return new SqliteConnection($"Data Source={GetDbPath(id)}");
  }

  public static bool Exists(string id)
  {
    return File.Exists(GetDbPath(id));
  }

  public static void CreateResources()
  {
    using (var connection = CreateConnection(resources))
    {
      connection.Open();

      {
        var command = connection.CreateCommand();
        command.CommandText = "CREATE TABLE IF NOT EXISTS Entities (kind TEXT, id TEXT, content TEXT)";
        using (var reader = command.ExecuteReader())
        {
          // TODO: check error
        }
      }
    }
  }

  public static void CreateCreatures()
  {
    using (var connection = CreateConnection(creatures))
    {
      connection.Open();

      {
        var command = connection.CreateCommand();
        command.CommandText = "CREATE TABLE IF NOT EXISTS Entities (kind TEXT, id TEXT, content TEXT)";
        using (var reader = command.ExecuteReader())
        {
          // TODO: check error
        }
      }
    }
  }

  public static void CreateWorld(string id)
  {
    using (var connection = CreateConnection(id))
    {
      connection.Open();

      {
        var command = connection.CreateCommand();
        command.CommandText = "CREATE TABLE IF NOT EXISTS Entities (kind TEXT, id TEXT, content TEXT)";
        using (var reader = command.ExecuteReader())
        {
          // TODO: check error
        }
      }

      // list of commands
      {
        var command = connection.CreateCommand();
        command.CommandText = "CREATE TABLE IF NOT EXISTS Commands (id TEXT, content TEXT)";
        using (var reader = command.ExecuteReader())
        {
          // TODO: check error
        }
      }

      // list of messages
      {
        var command = connection.CreateCommand();
        command.CommandText = "CREATE TABLE IF NOT EXISTS Messages (id TEXT, threadId TEXT, time INTEGER, content TEXT)";
        using (var reader = command.ExecuteReader())
        {
          // TODO: check error
        }
      }
    }
  }

  private static JsonSerializerOptions jsonOptions = new JsonSerializerOptions()
  {
    DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingDefault
  };

  public static string SerializeEntity<T>(T ent)
  {
    string s = JsonSerializer.Serialize(ent, jsonOptions);
    return s;
  }

  internal static T DeserializeEntity<T>(string blob)
  {
    return JsonSerializer.Deserialize<T>(blob);
  }
}

public class GameDb
{
  public readonly EntityDb World;
  public readonly EntityDb Resources;
  public readonly EntityDb Avatars;

  public GameDb(string id)
  {
    World = new EntityDb(id);
    Resources = new EntityDb(WorldDbStatics.resources);
    Avatars = new EntityDb(WorldDbStatics.creatures);
  }
}

public class EntityDb
{
  private SqliteConnection _connection;
  private string _id;

  public EntityDb(string id)
  {
    _id = id;
    _connection = WorldDbStatics.CreateConnection(id);
    _connection.Open();
  }

  public void SetWorldProp(string id)
  {
    var command = _connection.CreateCommand();
    command.CommandText = "INSERT INTO Project(id) VALUES($id)";
    command.Parameters.AddWithValue("$id", id);

    var inserted = command.ExecuteNonQuery();
    if (inserted != 1)
    {
      throw new ArgumentException("Cannot insert");
    }
  }


  public void InsertEntity<T>(string kind, string id, T content) where T : class
  {
    var contentBlob = WorldDbStatics.SerializeEntity(content);

    var command = _connection.CreateCommand();
    command.CommandText = "INSERT INTO Entities(kind, id, content) VALUES($kind, $id, $content)";
    command.Parameters.AddWithValue("$kind", kind);
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$content", contentBlob);

    var inserted = command.ExecuteNonQuery();
    if (inserted != 1)
    {
      throw new ArgumentException("Cannot insert");
    }
  }

  public void InsertEntityRaw(string kind, string id, string content)
  {
    var command = _connection.CreateCommand();
    command.CommandText = "INSERT INTO Entities(kind, id, content) VALUES($kind, $id, $content)";
    command.Parameters.AddWithValue("$kind", kind);
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$content", content);

    var inserted = command.ExecuteNonQuery();
    if (inserted != 1)
    {
      throw new ArgumentException("Cannot insert");
    }
  }

  public void UpdateEntity<T>(string kind, string id, T content) where T : class
  {
    if (!TryUpdateEntity(kind, id, content))
    {
      throw new ArgumentException("Cannot insert");
    }
  }

  public void UpdateEntityRaw(string kind, string id, string content)
  {
    if (!TryUpdateEntityRaw(kind, id, content))
    {
      throw new ArgumentException("Cannot insert");
    }
  }

  public bool TryUpdateEntity<T>(string kind, string id, T content) where T : class
  {
    var contentBlob = WorldDbStatics.SerializeEntity(content);

    var command = _connection.CreateCommand();
    command.CommandText = "UPDATE Entities SET content = $content WHERE kind == $kind AND id == $id";
    command.Parameters.AddWithValue("$kind", kind);
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$content", contentBlob);

    var updated = command.ExecuteNonQuery();
    if (updated != 1)
    {
      return false;
    }

    return true;
  }

  public bool TryUpdateEntityRaw(string kind, string id, string content)
  {
    var command = _connection.CreateCommand();
    command.CommandText = "UPDATE Entities SET content = $content WHERE kind == $kind AND id == $id";
    command.Parameters.AddWithValue("$kind", kind);
    command.Parameters.AddWithValue("$id", id);
    command.Parameters.AddWithValue("$content", content);

    var updated = command.ExecuteNonQuery();
    if (updated != 1)
    {
      return false;
    }

    return true;
  }

  internal List<string> LoadEntities(string entityKind)
  {
    var ent = new List<string>();

    var command = _connection.CreateCommand();
    command.CommandText = "SELECT * FROM Entities WHERE kind == $kind";
    command.Parameters.AddWithValue("$kind", entityKind);
    using (var reader = command.ExecuteReader())
    {
      while (reader.Read())
      {
        ent.Add(reader["content"] as string);
      }
    }

    return ent;
  }

  internal List<Tuple<string, string>> LoadEntities2(string entityKind)
  {
    var ent = new List<Tuple<string, string>>();

    var command = _connection.CreateCommand();
    command.CommandText = "SELECT * FROM Entities WHERE kind == $kind";
    command.Parameters.AddWithValue("$kind", entityKind);
    using (var reader = command.ExecuteReader())
    {
      while (reader.Read())
      {
        var value = reader["content"] as string;
        var id = reader["id"] as string;
        ent.Add(new Tuple<string, string>(id, value));
      }
    }

    return ent;
  }

  internal T LoadEntity<T>(string entityKind, string id) where T : class
  {
    var command = _connection.CreateCommand();
    command.CommandText = "SELECT * FROM Entities WHERE kind == $kind AND id == $id";
    command.Parameters.AddWithValue("$kind", entityKind);
    command.Parameters.AddWithValue("$id", id);
    using (var reader = command.ExecuteReader())
    {
      while (reader.Read())
      {
        var data = reader["content"] as string;
        return WorldDbStatics.DeserializeEntity<T>(data);
      }
    }

    return null;
  }
}
