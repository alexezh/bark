var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddSignalR();

var app = builder.Build();

// initialize storage
ProjectCollection.Instance.Initialize();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
  // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
  app.UseHsts();
}

//app.UseHttpsRedirection();
var staticOptions = new StaticFileOptions();
staticOptions.ServeUnknownFileTypes = true;
app.UseStaticFiles(staticOptions);
app.UseRouting();
app.UseAuthorization();

//app.MapControllerRoute(
//    name: "default",
//    pattern: "{controller=ProjectList}/{action=ListProjects}");

app.MapControllerRoute(
    name: "login",
    pattern: "/api/{controller=Login}",
      new { controller = "Login", action = "Login" });

app.MapControllerRoute(
    name: "createProject",
    pattern: "/api/{controller=ProjectList}/{action=CreateProject}");

app.MapControllerRoute(
    name: "listProjects",
    pattern: "/api/{controller=ProjectList}/{action=ListProjects}");

app.MapControllerRoute(
    name: "getStrings",
    pattern: "/api/{controller=Project}/{action=GetStrings}/{id?}");

app.MapControllerRoute(
    name: "updateStrings",
    pattern: "/api/{controller=Project}/{action=SetStrings}/{id?}");

app.MapControllerRoute(
    name: "getArray",
    pattern: "/api/{controller=Project}/{action=GetArray}/{id?}");

app.MapControllerRoute(
    name: "updateArray",
    pattern: "/api/{controller=Project}/{action=SetArray}/{id?}");

app.MapFallbackToFile("index.html"); ;
app.MapHub<RctHub>("/updates");

app.Run();
