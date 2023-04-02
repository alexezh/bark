using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace barksrv.Controllers;

public class LoginController : Controller
{
  [HttpPost]
  public async Task<WireLoginResponse> GetStrings(string id)
  {
    using (StreamReader reader = new StreamReader(Request.Body, Encoding.UTF8))
    {
      string content = await reader.ReadToEndAsync();
      WireLoginRequest fetch = JsonSerializer.Deserialize<WireLoginRequest>(content);

      return new WireLoginResponse() { url = "/digshell.html" };
    }
  }
}