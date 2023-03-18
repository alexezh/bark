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

      return prj.FetchStrings(fetch.pattern);
    }
  }

  [HttpPost]
  public async Task<string> SetString(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireString code = JsonSerializer.Deserialize<WireString>(content);

      Project prj = ProjectCollection.Instance.GetProject(id);
      if (prj == null)
      {
        return "Unknown world";
      }

      prj.SetString(code.name, code.data);
    }

    return "OK";
  }
}