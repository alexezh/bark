using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace barksrv.Controllers;

public class ProjectListController : Controller
{
  [HttpGet]
  public JsonResult ListProjects()
  {
    // Project prj = ProjectCollection.Instance.GetProject(id);
    // if (prj == null)
    // {
    //   return Json("Unknown world");
    // }
    // return Json(prj.ToWire());
    throw new NotImplementedException();
  }

  [HttpGet]
  public JsonResult CreateProject()
  {
    // Project prj = ProjectCollection.Instance.GetProject();
    // if (prj == null)
    // {
    //   return Json("Unknown world");
    // }
    // return Json(prj.ToWire());
    throw new NotImplementedException();
  }
}