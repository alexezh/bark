using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace barksrv.Controllers;

public class ProjectController : Controller
{
  [HttpPost]
  public async Task<IEnumerable<WireString>> GetStrings(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireGetStringsRequest fetch = JsonSerializer.Deserialize<WireGetStringsRequest>(content);

      Project prj = ProjectCollection.Instance.GetProject(id);
      if (prj == null)
      {
        throw new ArgumentException("Unknown world");
      }

      return prj.GetStrings(fetch.pattern);
    }
  }

  [HttpPost]
  public async Task<string> SetStrings(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireString[] code = JsonSerializer.Deserialize<WireString[]>(content);

      Project prj = ProjectCollection.Instance.GetProject(id);
      if (prj == null)
      {
        return "Unknown world";
      }

      prj.SetStrings(code);
    }

    return "OK";
  }

  [HttpPost]
  public async Task<IEnumerable<WireDict>> GetDict(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      var request = JsonSerializer.Deserialize<WireGetDictRequest>(content);

      Project prj = ProjectCollection.Instance.GetProject(id);
      if (prj == null)
      {
        throw new ArgumentException("Unknown world");
      }

      return prj.GetDict(request.key, request.fields);
    }
  }

  [HttpPost]
  public async Task<string> SetDict(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      var request = JsonSerializer.Deserialize<WireSetDictRequest>(content);

      Project prj = ProjectCollection.Instance.GetProject(id);
      if (prj == null)
      {
        return "Unknown world";
      }

      prj.SetDict(request.key, request.fields);
    }

    return "OK";
  }
}