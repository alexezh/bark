public class GridPos
{
  public int x { get; set; }
  public int y { get; set; }
}

public class Avatar
{
  public string id { get; set; }
  public string layerId { get; set; }
  public GridPos pos { get; set; }
  public string code { get; set; }
  public string rt { get; set; }
  public bool isDirty;
}

public class Character : Avatar
{
  public string skinUrl { get; set; }
  public string currentPokemon { get; set; }
}

public class Pokemon : Avatar
{
  public string pokedexId { get; set; }
  public int level;
  public int health;
}

public class WirePokedexEntry
{
  public string id { get; set; }
  public string name { get; set; }
  public string kind { get; set; }
  public string battlerFrontUrl { get; set; }
  public string battlerBackUrl { get; set; }
  public string iconUrl { get; set; }
  public string skinUrl { get; set; }
}

public class WireAvatar
{
  public Character character { get; set; }
  public Pokemon pokemon { get; set; }
}

public class WireSpawnPokemonRequest
{
  public string pokedexId { get; set; }
  public string name { get; set; }
  public string layerId { get; set; }
}

public class WireSpawnCharacterRequest
{
  public string name { get; set; }
  public string skinUrl { get; set; }
}

public class WireUpdateAvatarCode
{
  public string avatarId { get; set; }
  public string code { get; set; }
}

public class WireUpdateRuntimeProps
{
  public string avatarId { get; set; }
  public string rt { get; set; }
}

public class AvatarCollection
{
  private object _lock = new object();
  private FileCollection _fileColl = null;
  private readonly Dictionary<string, Avatar> _avatars = new Dictionary<string, Avatar>();
  private EntityDb _db;
  private Timer _saveTimer;
  private int _nextId = 200;
  public const string EntityKind = "Avatar";

  private string NewId()
  {
    var id = _nextId;
    _nextId++;
    return id.ToString();
  }

  public AvatarCollection(EntityDb db)
  {
    _db = db;
    _saveTimer = new Timer(OnSaveTimer, null, TimeSpan.Zero, TimeSpan.FromSeconds(5));
  }

  public void Add(Avatar avatar)
  {
    _avatars.Add(avatar.id, avatar);

    if (avatar.layerId == null || avatar.pos == null)
    {
      avatar.layerId = "ground";
      avatar.pos = new GridPos();
    }

    _db.InsertEntity(EntityKind, avatar.id, AvatarToWire(avatar));
  }

  public void Load(FileCollection codeColl)
  {
    _fileColl = codeColl;
    var avatarBlobs = _db.LoadEntities(EntityKind);
    foreach (var blob in avatarBlobs)
    {
      var wireAvatar = WorldDbStatics.DeserializeEntity<WireAvatar>(blob);
      Avatar avatar;
      if (wireAvatar.character != null)
      {
        avatar = wireAvatar.character;
      }
      else if (wireAvatar.pokemon != null)
      {
        avatar = wireAvatar.pokemon;
      }
      else
      {
        throw new ArgumentException();
      }

      // ignore old guid based entries
      if (avatar.id.Length > 20)
      {
        continue;
      }
      else
      {
        if (!int.TryParse(avatar.id, out var id))
        {
          continue;
        }

        _nextId = Math.Max(_nextId, id + 1);
      }

      _avatars.Add(avatar.id, avatar);
    }
  }

  private void OnSaveTimer(object state)
  {
    lock (_lock)
    {
      foreach (var entry in _avatars)
      {
        if (entry.Value.isDirty)
        {
          _db.UpdateEntity(EntityKind, entry.Value.id, AvatarToWire(entry.Value));
          entry.Value.isDirty = false;
        }
      }
    }
  }

  private WireAvatar AvatarToWire(Avatar avatar)
  {
    if (avatar is Pokemon)
    {
      return new WireAvatar() { pokemon = (avatar as Pokemon) };
    }
    else
    {
      return new WireAvatar() { character = (avatar as Character) };
    }
  }

  public IEnumerable<WireAvatar> ToWire()
  {
    return _avatars.Select(x => AvatarToWire(x.Value));
  }

  internal WireAvatar SpawnPokemon(WireSpawnPokemonRequest? spawnParams)
  {
    lock (_lock)
    {
      if (!_fileColl.TryGet("pokedex/" + spawnParams.pokedexId, out var pokedexEntry))
      {
        throw new ArgumentException();
      }

      var pokemon = new Pokemon()
      {
        id = NewId(),
        pos = new GridPos(),
        pokedexId = spawnParams.pokedexId,
      };

      Add(pokemon);

      return new WireAvatar() { pokemon = pokemon };
    }
  }

  internal WireAvatar SpawnCharacter(WireSpawnCharacterRequest? spawnParams)
  {
    lock (_lock)
    {
      var character = new Character()
      {
        id = NewId(),
        skinUrl = spawnParams.skinUrl,
        pos = new GridPos(),
      };

      Add(character);

      return new WireAvatar() { character = character };
    }
  }

  internal void UpdatePosition(RctUpdateAvatarPosition? msg)
  {
    lock (_lock)
    {
      _avatars.TryGetValue(msg.avatarId, out var avatar);

      if (msg.newPos != null)
      {
        avatar.pos = msg.newPos;
        avatar.isDirty = true;
      }
    }
  }

  internal void UpdateCode(string avatarId, string code)
  {
    lock (_lock)
    {
      if (!_avatars.TryGetValue(avatarId, out var avatar))
      {
        throw new ArgumentException();
      }

      avatar.code = code;
      _db.UpdateEntity(EntityKind, avatar.id, AvatarToWire(avatar));
    }
  }

  internal void UpdateRuntimeProps(string avatarId, string rt)
  {
    lock (_lock)
    {
      if (!_avatars.TryGetValue(avatarId, out var avatar))
      {
        throw new ArgumentException();
      }

      avatar.rt = rt;
      _db.UpdateEntity(EntityKind, avatar.id, AvatarToWire(avatar));
    }
  }
}

